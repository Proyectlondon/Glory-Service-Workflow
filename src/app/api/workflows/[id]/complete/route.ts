import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { AREA_ORDER, AREA_LABEL_MAP } from "@/lib/types";

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

    if (fields) {
      await db.workflow.update({
        where: { id },
        data: {
          status: "COMPLETED",
          currentArea: AREA_ORDER[AREA_ORDER.length - 1],
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
        },
      });
    } else {
      await db.workflow.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
    }

    await db.notification.create({
      data: {
        workflowId: id,
        message: `Flujo "${workflow.name}" completado exitosamente. Todas las áreas han diligenciado el formato.`,
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
