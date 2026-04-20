import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { HUB_AREA, AREA_LABEL_MAP } from "@/lib/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { sendWorkflowNotification } from "@/lib/mail";

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      area: string;
    };
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetArea, fields } = body;

    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Fetch the user from DB for name
    const dbUser = await db.user.findUnique({ where: { id: authUser.id } });
    const userName = dbUser?.name || authUser.email;

    const workflow = await db.workflow.findUnique({ where: { id } });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.status === "COMPLETED") {
      return NextResponse.json({ error: "Workflow already completed" }, { status: 400 });
    }

    // Check permission: admin can always advance, regular users only from their area
    if (authUser.role !== "admin" && workflow.currentArea !== authUser.area) {
      return NextResponse.json(
        { error: "No tienes permiso para avanzar este formato" },
        { status: 403 }
      );
    }

    const current = workflow.currentArea;
    const completedAreas: string[] = JSON.parse(workflow.completedAreas || "[]");

    // Dispatcher can only advance to Executive Accountant
    if (current === "DISPATCHER" && targetArea !== "EXECUTIVE_ACCOUNTANT") {
      return NextResponse.json(
        { error: "Dispatcher solo puede enviar a Ejecutiva de Cuenta" },
        { status: 400 }
      );
    }

    // Dependencies can only return to Executive Accountant
    const dependencyIds = ["FINANCE", "OPERATIONS", "LEGAL", "IT", "SUPPLY_CHAIN", "SERVICE_SUPPORT"];
    if (dependencyIds.includes(current) && targetArea !== "EXECUTIVE_ACCOUNTANT") {
      return NextResponse.json(
        { error: "Las dependencias solo pueden devolver a Ejecutiva de Cuenta" },
        { status: 400 }
      );
    }

    // Only Executive Accountant can escalate to dependencies
    if (current === "EXECUTIVE_ACCOUNTANT" && targetArea !== "EXECUTIVE_ACCOUNTANT" && !dependencyIds.includes(targetArea)) {
      return NextResponse.json(
        { error: "Área destino no válida" },
        { status: 400 }
      );
    }

    // When leaving an area (not hub), mark it as completed
    if (dependencyIds.includes(current) && !completedAreas.includes(current)) {
      completedAreas.push(current);
    }

    const action = current === "DISPATCHER"
      ? "FORWARDED"
      : current === "EXECUTIVE_ACCOUNTANT" && targetArea !== "EXECUTIVE_ACCOUNTANT"
      ? "ESCALATED"
      : "RETURNED";

    const updateData: any = {
      currentArea: targetArea,
      completedAreas: JSON.stringify(completedAreas),
      updatedBy: authUser.id,
    };

    // Set createdBy if not set
    if (!workflow.createdBy) {
      updateData.createdBy = authUser.id;
    }

    if (fields) {
      updateData.fields = {
        deleteMany: {},
        create: fields.map((f: any, i: number) => ({
          label: f.label,
          value: f.value || "",
          fieldType: f.fieldType || "text",
          area: f.area || "DISPATCHER",
          required: f.required || false,
          orderIndex: f.orderIndex ?? i,
        })),
      };
    }

    await db.workflow.update({ where: { id }, data: updateData });

    await db.areaLog.create({
      data: {
        workflowId: id,
        fromArea: current,
        toArea: targetArea,
        action,
      },
    });

    let notifMessage = "";
    let notifType = "area_change";

    if (action === "FORWARDED") {
      notifMessage = `${userName} envió "${workflow.name}" a Ejecutiva de Cuenta para procesamiento.`;
      notifType = "area_change";
    } else if (action === "ESCALATED") {
      notifMessage = `${userName} (Ejecutiva) escaló "${workflow.name}" a ${AREA_LABEL_MAP[targetArea]} por información faltante.`;
      notifType = "escalation";
    } else if (action === "RETURNED") {
      notifMessage = `${userName} (${AREA_LABEL_MAP[current]}) devolvió "${workflow.name}" a Ejecutiva de Cuenta con información diligenciada.`;
      notifType = "return";
    }

    await db.notification.create({
      data: {
        workflowId: id,
        message: notifMessage,
        type: notifType,
      },
    });

    // Email notification: look up user for target area and send real email
    const targetAreaUser = await db.user.findFirst({
      where: { area: targetArea, isActive: true },
    });
    
    if (targetAreaUser) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendWorkflowNotification({
        to: targetAreaUser.email,
        subject: `Nuevo Workflow: ${workflow.name} asignado a ${AREA_LABEL_MAP[targetArea]}`,
        workflowName: workflow.name,
        message: notifMessage,
        actionLabel: "Revisar Workflow",
        actionUrl: `${appUrl}/dashboard?workflowId=${id}`
      });
    }

    const updated = await db.workflow.findUnique({
      where: { id },
      include: { fields: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error advancing workflow:", error);
    return NextResponse.json({ error: "Failed to advance workflow" }, { status: 500 });
  }
}
