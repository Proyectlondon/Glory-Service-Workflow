import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const templates = await db.template.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, fields } = body;

    if (!name || !fields || fields.length === 0) {
      return NextResponse.json({ error: "Name and fields are required" }, { status: 400 });
    }

    const template = await db.template.create({
      data: {
        name,
        fields: fields.map((f: any, index: number) => ({
          label: f.label,
          fieldType: f.fieldType || "text",
          area: f.area || "DISPATCHER",
          required: f.required || false,
          orderIndex: f.orderIndex ?? index,
        })),
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
