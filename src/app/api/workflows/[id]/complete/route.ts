import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { AREA_LABEL_MAP } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fields } = body;

    const workflow = await db.workflow.findUnique({ where: { id } });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.currentArea !== "EXECUTIVE_ACCOUNTANT") {
      return NextResponse.json(
        { error: "Solo la Ejecutiva de Cuenta puede completar el formato" },
        { status: 400 }
      );
    }

    const updateData: any = { status: "COMPLETED" };

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

    await db.notification.create({
      data: {
        workflowId: id,
        message: `La Ejecutiva de Cuenta completó "${workflow.name}" exitosamente. El formato está listo para descarga.`,
        type: "complete",
      },
    });

    const updated = await db.workflow.findUnique({
      where: { id },
      include: { fields: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error completing workflow:", error);
    return NextResponse.json({ error: "Failed to complete workflow" }, { status: 500 });
  }
}
