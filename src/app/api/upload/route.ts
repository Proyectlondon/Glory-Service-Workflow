import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extraction using mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });
    
    // Logic to detect fields: looks for [Field Name] or [Field: Area]
    // Example regex: /\[([^\]]+)\]/g
    const fieldRegex = /\[([^\]]+)\]/g;
    const matches = [...text.matchAll(fieldRegex)];
    
    const fields = matches.map((match, index) => {
      const fullContent = match[1].trim();
      let label = fullContent;
      let area = "DISPATCHER";
      let fieldType = "text";

      // Basic heuristic: if it looks like a number search
      if (label.toLowerCase().includes("valor") || label.toLowerCase().includes("monto")) {
        fieldType = "number";
      } else if (label.toLowerCase().includes("fecha")) {
        fieldType = "date";
      } else if (label.length > 50) {
        fieldType = "textarea";
      }

      // Assign areas based on keywords
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes("financiera") || lowerLabel.includes("pago") || lowerLabel.includes("costo")) {
        area = "FINANCE";
      } else if (lowerLabel.includes("operativa") || lowerLabel.includes("logística")) {
        area = "OPERATIONS";
      } else if (lowerLabel.includes("legal") || lowerLabel.includes("contrato")) {
        area = "LEGAL";
      } else if (lowerLabel.includes("técnica") || lowerLabel.includes("it") || lowerLabel.includes("sistema")) {
        area = "IT";
      } else if (lowerLabel.includes("ejecutiva") || lowerLabel.includes("cuenta")) {
        area = "EXECUTIVE_ACCOUNTANT";
      }

      return {
        label,
        value: "",
        fieldType,
        area,
        required: false,
        orderIndex: index
      };
    });

    return NextResponse.json({
      documentData: text,
      fields: fields,
      documentName: file.name
    });

  } catch (error: any) {
    console.error("Error procesando Word:", error);
    return NextResponse.json(
      { error: "Error al procesar el documento Word", details: error.message },
      { status: 500 }
    );
  }
}
