import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        fields: { orderBy: { orderIndex: "asc" } },
        _count: { select: { notifications: true } },
      },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, documentName, documentData, fields } = body;

    if (!name || !documentName) {
      return NextResponse.json({ error: "Name and documentName are required" }, { status: 400 });
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        documentName,
        documentData: documentData || "",
        currentArea: "DISPATCHER",
        status: "IN_PROGRESS",
        fields: fields
          ? {
              create: fields.map((f: { label: string; value?: string; fieldType?: string; area?: string; required?: boolean; orderIndex?: number }, i: number) => ({
                label: f.label,
                value: f.value || "",
                fieldType: f.fieldType || "text",
                area: f.area || "DISPATCHER",
                required: f.required || false,
                orderIndex: f.orderIndex ?? i,
              })),
            }
          : undefined,
      },
      include: { fields: { orderBy: { orderIndex: "asc" } } },
    });

    await db.notification.create({
      data: {
        workflowId: workflow.id,
        message: `Flujo de trabajo "${workflow.name}" creado y asignado a Dispatcher.`,
        type: "area_change",
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
