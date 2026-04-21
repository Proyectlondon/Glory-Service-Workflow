import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.template.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Plantilla eliminada" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Error al eliminar plantilla" },
      { status: 500 }
    );
  }
}
