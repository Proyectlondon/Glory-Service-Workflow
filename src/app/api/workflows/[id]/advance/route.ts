import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { AREA_ORDER } from "@/lib/types";

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

    if (workflow.status === "COMPLETED") {
      return NextResponse.json({ error: "Workflow already completed" }, { status: 400 });
    }

    const currentIndex = AREA_ORDER.indexOf(workflow.currentArea);
    if (currentIndex >= AREA_ORDER.length - 1) {
      return NextResponse.json({ error: "Already at the last area" }, { status: 400 });
    }

    const nextArea = AREA_ORDER[currentIndex + 1];

    if (fields) {
      await db.workflow.update({
        where: { id },
        data: {
          currentArea: nextArea,
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
        data: { currentArea: nextArea },
      });
    }

    await db.areaLog.create({
      data: {
        workflowId: id,
        fromArea: workflow.currentArea,
        toArea: nextArea,
        action: "ADVANCED",
      },
    });

    await db.notification.create({
      data: {
        workflowId: id,
        message: `Flujo "${workflow.name}" avanzó de ${workflow.currentArea} a ${nextArea}.`,
        type: "area_change",
      },
    });

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
