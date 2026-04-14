import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { orderIndex: "asc" } },
        notifications: { orderBy: { createdAt: "desc" } },
        areaLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, fields } = body;

    const existing = await db.workflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const workflow = await db.workflow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(fields && {
          fields: {
            deleteMany: {},
            create: fields.map((f: { label: string; value?: string; fieldType?: string; area?: string; required?: boolean; orderIndex?: number }, i: number) => ({
              label: f.label,
              value: f.value || "",
              fieldType: f.fieldType || "text",
              area: f.area || "DISPATCHER",
              required: f.required || false,
              orderIndex: f.orderIndex ?? i,
            })),
          },
        }),
      },
      include: { fields: { orderBy: { orderIndex: "asc" } } },
    });

    await db.notification.create({
      data: {
        workflowId: id,
        message: `Información actualizada en "${workflow.name}" por el área actual.`,
        type: "save",
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.workflow.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
