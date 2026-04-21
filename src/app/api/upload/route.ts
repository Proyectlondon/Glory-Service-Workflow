import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

// Heuristics para asignar área y tipo de campo
const KEYWORDS_TO_AREA: Record<string, string> = {
  "nombre": "DISPATCHER",
  "correo": "DISPATCHER",
  "fecha": "DISPATCHER",
  "descripcion": "EXECUTIVE_ACCOUNTANT",
  "cliente": "EXECUTIVE_ACCOUNTANT",
  "cuenta": "EXECUTIVE_ACCOUNTANT",
  "prioridad": "EXECUTIVE_ACCOUNTANT",
  "valor": "EXECUTIVE_ACCOUNTANT",
  "costo": "FINANCE",
  "factura": "FINANCE",
  "requisito": "OPERATIONS",
  "entrega": "OPERATIONS",
  "legal": "LEGAL",
  "ley": "LEGAL",
  "recurso": "IT",
  "tecnico": "IT",
  "proveedor": "SUPPLY_CHAIN",
  "cadena": "SUPPLY_CHAIN",
  "soporte": "SERVICE_SUPPORT",
  "observacion": "SERVICE_SUPPORT"
};

function assignAreaByLabel(label: string): string {
  const normalized = label.toLowerCase();
  for (const [key, area] of Object.entries(KEYWORDS_TO_AREA)) {
    if (normalized.includes(key)) {
      return area;
    }
  }
  return "DISPATCHER"; // default
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploadeado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract raw text using mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });

    // Encontrar placeholders en formato {{Nombre del Campo}}
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.add(match[1].trim());
    }

    const extractedFields = Array.from(matches).map((label, index) => ({
      label,
      value: "",
      fieldType: label.toLowerCase().includes("fecha") ? "date" : label.toLowerCase().includes("valor") || label.toLowerCase().includes("costo") ? "number" : "text",
      area: assignAreaByLabel(label),
      required: true,
      orderIndex: index
    }));

    return NextResponse.json({
      fields: extractedFields,
      documentData: buffer.toString("base64")
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json({ error: "Error al procesar el documento Word." }, { status: 500 });
  }
}
