import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Only .docx files are supported" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value;
    const lines = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const fields: { label: string; value: string; fieldType: string; area: string; required: boolean }[] = [];
    let currentFieldLabel = "";

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0 && colonIndex < line.length - 1) {
        const label = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (label.length > 0 && label.length < 100) {
          fields.push({
            label,
            value: value || "",
            fieldType: value.length > 100 ? "textarea" : "text",
            area: "DISPATCHER",
            required: false,
          });
          currentFieldLabel = label;
        }
      } else if (line.length > 2 && line.length < 80) {
        if (currentFieldLabel && fields.length > 0 && !fields[fields.length - 1].value) {
          fields[fields.length - 1].value = line;
        } else {
          fields.push({
            label: line,
            value: "",
            fieldType: "text",
            area: "DISPATCHER",
            required: false,
          });
        }
      }
    }

    if (fields.length === 0) {
      fields.push(
        { label: "Nombre del Solicitante", value: "", fieldType: "text", area: "DISPATCHER", required: true },
        { label: "Fecha de Solicitud", value: "", fieldType: "date", area: "DISPATCHER", required: true },
        { label: "Descripción del Servicio", value: "", fieldType: "textarea", area: "DISPATCHER", required: true },
        { label: "Prioridad", value: "", fieldType: "text", area: "DISPATCHER", required: false },
        { label: "Ejecutivo Asignado", value: "", fieldType: "text", area: "SERVICE_EXECUTIVE", required: true },
        { label: "Recursos Requeridos", value: "", fieldType: "textarea", area: "SERVICE_EXECUTIVE", required: false },
        { label: "Costo Estimado", value: "", fieldType: "number", area: "ACCOUNTANT", required: true },
        { label: "Centro de Costo", value: "", fieldType: "text", area: "ACCOUNTANT", required: false },
        { label: "Viabilidad Técnica", value: "", fieldType: "textarea", area: "SERVICE_SUPPORT", required: true },
        { label: "Fecha de Entrega Estimada", value: "", fieldType: "date", area: "SERVICE_SUPPORT", required: false },
        { label: "Proveedor Asignado", value: "", fieldType: "text", area: "SUPPLY_CHAIN", required: false },
        { label: "Número de Orden", value: "", fieldType: "text", area: "SUPPLY_CHAIN", required: true },
        { label: "Observaciones Finales", value: "", fieldType: "textarea", area: "SUPPLY_CHAIN", required: false }
      );
    }

    const base64Data = buffer.toString("base64");

    return NextResponse.json({
      fileName: file.name,
      extractedText: text,
      fields,
      documentData: base64Data,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
