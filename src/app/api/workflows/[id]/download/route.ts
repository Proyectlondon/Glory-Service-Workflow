import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { AREA_LABEL_MAP } from "@/lib/types";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Packer,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  VerticalAlign,
} from "docx";
import { CORPORATE_LOGO_BASE64 } from "@/lib/logo_base64";

const formatCurrency = (value: string, label: string) => {
  if (!label) return value;
  const currencyKeywords = [
    "costo", "precio", "valor", "total", "iva", "subtotal", "monto", 
    "pago", "presupuesto", "tarifa", "cuota", "honorarios"
  ];
  const normalizedLabel = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isCurrency = currencyKeywords.some((keyword) => normalizedLabel.includes(keyword));

  if (!isCurrency || !value || value.trim() === "" || value === "(Sin diligenciar)") return value;

  // Limpiar el valor de caracteres no numéricos
  const cleanValue = value.toString().replace(/[^\d.,]/g, "").replace(",", ".");
  const numericValue = parseFloat(cleanValue);

  if (isNaN(numericValue)) return value;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numericValue)
    .replace("COP", "$")
    .trim();
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: { fields: { orderBy: { orderIndex: "asc" } }, areaLogs: { orderBy: { createdAt: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const areas = ["DISPATCHER", "EXECUTIVE_ACCOUNTANT", "FINANCE", "OPERATIONS", "LEGAL", "IT", "SUPPLY_CHAIN", "SERVICE_SUPPORT"];
    const fieldsByArea = new Map<string, typeof workflow.fields>();
    for (const field of workflow.fields) {
      if (!fieldsByArea.has(field.area)) fieldsByArea.set(field.area, []);
      fieldsByArea.get(field.area)!.push(field);
    }

    const children: (Paragraph | Table)[] = [];

    // Header Content
    const header = new Header({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "1E3A5F" },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: Buffer.from(CORPORATE_LOGO_BASE64, "base64"),
                          transformation: { width: 120, height: 40 },
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: "GLORY GLOBAL SOLUTIONS (COLOMBIA)",
                          bold: true,
                          size: 20,
                          color: "1E3A5F",
                          font: "Arial",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `COTIZACIÓN: ${workflow.id.slice(-8).toUpperCase()}`,
                          bold: true,
                          size: 18,
                          color: "666666",
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Body Title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
        children: [
          new TextRun({
            text: workflow.name.toUpperCase(),
            bold: true,
            size: 32,
            color: "1E3A5F",
            font: "Arial",
          }),
        ],
      })
    );

    // Metadata Section
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Fecha: ", bold: true, font: "Arial", size: 20 }),
          new TextRun({ text: new Date().toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' }), font: "Arial", size: 20 }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Estado: ", bold: true, font: "Arial", size: 20 }),
          new TextRun({ 
            text: workflow.status === "COMPLETED" ? "COMPLETADO" : "EN PROGRESO", 
            color: workflow.status === "COMPLETED" ? "007AFF" : "FF9500",
            font: "Arial", 
            size: 20 
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Sections by Area
    for (const areaId of areas) {
      const areaFields = fieldsByArea.get(areaId);
      if (!areaFields || areaFields.length === 0) continue;

      const areaLabel = AREA_LABEL_MAP[areaId] || areaId;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: areaLabel.toUpperCase(),
              bold: true,
              size: 24,
              color: "FFFFFF",
              font: "Arial",
            }),
          ],
          shading: { type: ShadingType.SOLID, color: "1E3A5F", fill: "1E3A5F" },
          spacing: { before: 300, after: 200 },
          indent: { left: 100 },
        })
      );

      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "CAMPO", bold: true, size: 18, font: "Arial", color: "444444" })] })],
              shading: { type: ShadingType.SOLID, color: "F5F7F9", fill: "F5F7F9" },
              width: { size: 40, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "VALOR / DETALLE", bold: true, size: 18, font: "Arial", color: "444444" })] })],
              shading: { type: ShadingType.SOLID, color: "F5F7F9", fill: "F5F7F9" },
              width: { size: 60, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      ];

      for (const field of areaFields) {
        const hasValue = field.value && field.value.trim() !== "";
        const displayValue = hasValue ? formatCurrency(field.value, field.label) : "(Sin diligenciar)";
        
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: field.label,
                        size: 18,
                        font: "Arial",
                        bold: field.required,
                        color: "333333",
                      }),
                      field.required ? new TextRun({ text: " *", color: "CC0000", size: 18, font: "Arial" }) : undefined,
                    ].filter(Boolean) as TextRun[],
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 100, bottom: 100, left: 100 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: displayValue,
                        size: 18,
                        font: "Arial",
                        color: hasValue ? "000000" : "999999",
                        italics: !hasValue,
                      }),
                    ],
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 100, bottom: 100, left: 100 },
              }),
            ],
          })
        );
      }

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
            top: { style: BorderStyle.SINGLE, size: 4, color: "1E3A5F" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "1E3A5F" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "1E3A5F" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "1E3A5F" },
          }
        })
      );

      children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }));
    }

    // Footer content
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Glory Global Solutions (Colombia) - Documento generado automáticamente",
              size: 16,
              font: "Arial",
              color: "888888",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", size: 16, font: "Arial", color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "888888" }),
            new TextRun({ text: " de ", size: 16, font: "Arial", color: "888888" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: "Arial", color: "888888" }),
          ],
        }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          headers: { default: header },
          footers: { default: footer },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `Cotizacion_${workflow.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "_")}.docx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}
