import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
  ImageRun,
  Header,
  Footer,
  VerticalAlign,
} from "docx";
import { CORPORATE_LOGO_BASE64 } from "@/lib/logo_base64";

import { formatCOP, normalizeLabel } from "@/lib/formatters";

const formatCurrency = (value: string) => formatCOP(value);

const getNumericValue = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.toString().replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: { fields: { orderBy: { orderIndex: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Heuristic field extraction
    const findField = (keywords: string[]) => {
      const normalizedKeywords = keywords.map(k => normalizeLabel(k));
      return workflow.fields.find(f => {
        const label = normalizeLabel(f.label);
        return normalizedKeywords.some(k => label.includes(k));
      })?.value || "";
    };

    const clientName = findField(["cliente", "señores", "solicitado por"]) || "Cliente";
    const model = findField(["modelo", "equipo", "maquina"]) || "G-220";
    const serial = findField(["serie", "serial", "s/n"]) || "N/A";
    const location = findField(["lugar", "ubicación", "sitio", "ciudad"]) || "Bogotá";
    const refText = workflow.name || "Cotización de servicio";

    // Table mapping: identify fields that represent items
    // Heuristic: items in OPERATIONS or FINANCE that have a label starting with "PBA", "ASM", "Mano de obra", "Desplazamiento"
    // or any field that has a value and is likely a line item.
    const itemKeywords = ["pba", "asm", "mano de obra", "desplazamiento", "repuesto", "servicio", "viaticos", "mantenimiento", "reparacion"];
    const items = workflow.fields.filter(f => {
      const label = normalizeLabel(f.label);
      const isItem = itemKeywords.some(k => label.includes(k)) || f.label.includes(",");
      const hasNumericValue = f.value && f.value !== "(Sin diligenciar)" && getNumericValue(f.value) > 0;
      return (f.area === "OPERATIONS" || f.area === "FINANCE" || f.area === "EXECUTIVE_ACCOUNTANT") && isItem && hasNumericValue;
    });

    const children: (Paragraph | Table)[] = [];

    // Header with Logo and Ref/Date
    const header = new Header({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: Buffer.from(CORPORATE_LOGO_BASE64, "base64"),
                          transformation: { width: 150, height: 50 },
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.BOTTOM,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `COL_NT_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${workflow.id.slice(-4).toUpperCase()}`,
                          bold: true,
                          size: 20,
                          font: "Arial",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `Fecha: ${new Date().toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' })}`,
                          bold: true,
                          size: 20,
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

    // Body
    children.push(new Paragraph({ spacing: { before: 800 } }));

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Señores ", bold: true, font: "Arial", size: 24 }),
          new TextRun({ text: clientName, bold: true, font: "Arial", size: 24 }),
        ],
        spacing: { after: 300 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Ref. ", bold: true, font: "Arial", size: 22 }),
          new TextRun({ text: refText, font: "Arial", size: 22 }),
        ],
        spacing: { after: 400 },
      })
    );

    // Equipment Info
    const infoRows = [
      ["Modelo:", model],
      ["Serie:", serial],
      ["Lugar revisión:", location],
    ].map(([label, value]) => 
      new Paragraph({
        children: [
          new TextRun({ text: label.padEnd(15), bold: true, font: "Arial", size: 20 }),
          new TextRun({ text: value, font: "Arial", size: 20 }),
        ],
        spacing: { after: 50 },
      })
    );
    children.push(...infoRows);

    children.push(new Paragraph({ spacing: { before: 400 } }));

    // Items Table
    const tableHeader = new TableRow({
      tableHeader: true,
      children: [
        "Referencia", "Código", "Cantidad", "Costo Unit", "Costo Total"
      ].map(text => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 18, color: "FFFFFF", font: "Arial" })] })],
        shading: { fill: "1E3A5F" },
        verticalAlign: VerticalAlign.CENTER,
      })),
    });

    const tableRows = [tableHeader];
    let subtotal = 0;

    if (items.length > 0) {
      for (const item of items) {
        const val = getNumericValue(item.value);
        subtotal += val;
        // Try to extract code if it exists (e.g. "PBA, INNO MAIN VE (1547050A00)")
        let label = item.label;
        let code = "N/A";
        const codeMatch = label.match(/\(([^)]+)\)/);
        if (codeMatch) {
          code = codeMatch[1];
          label = label.replace(/\([^)]+\)/, "").trim();
        }

        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { left: 100 } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: code, size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(item.value), size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(item.value), size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
            ],
          })
        );
      }
    } else {
      // Fallback row if no items found
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Servicio de mantenimiento / reparación", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { left: 100 } }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "S001", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$ 0", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$ 0", size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER }),
          ],
        })
      );
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
        borders: {
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        },
      })
    );

    // Totals Table
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    children.push(
      new Table({
        width: { size: 40, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.RIGHT,
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total, sin IVA", bold: true, size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(subtotal.toString()), size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "IVA", bold: true, size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(iva.toString()), size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total + IVA", bold: true, size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(total.toString()), size: 18, font: "Arial" })] })], verticalAlign: VerticalAlign.CENTER, margins: { right: 100 } }),
            ],
          }),
        ],
        borders: {
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        },
      })
    );

    // Terms and Conditions
    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Se ofrece con garantía de 20 días calendario a partir de la intervención en las instalaciones del cliente.", font: "Arial", size: 18 }),
        ],
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Esta garantía no cubre:", font: "Arial", size: 18 }),
        ],
        spacing: { after: 200 },
      })
    );

    const exclusions = [
      "Aquellos causados por transporte o embalaje del equipo.",
      "Problemas causados por operación o uso inadecuado. Maltrato, golpes, humedad y en general cualquier daño ocasionado por un mal ambiente de trabajo.",
      "Instalación eléctrica defectuosa, tal como toma de corriente, reguladores o cableado en mal estado, o cualquiera derivado de la calidad de alimentación eléctrica.",
      "Cualquier daño producto de los servicios realizados por un tercero no autorizado por Glory Global Solutions (Colombia).",
    ];

    exclusions.forEach(text => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${text}`, font: "Arial", size: 18 })],
          indent: { left: 400 },
        })
      );
    });

    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Todos los valores presentados están en pesos colombianos y tienen forma de ", font: "Arial", size: 18 }),
          new TextRun({ text: "pago anticipado ", bold: true, italics: true, font: "Arial", size: 18 }),
          new TextRun({ text: "del día de facturación, valor total con IVA.", font: "Arial", size: 18 }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Los valores especificados tienen una vigencia de 30 días.", font: "Arial", size: 18 })],
        spacing: { before: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Cordialmente", font: "Arial", size: 18 })],
        spacing: { before: 400, after: 800 },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Glory Global Solutions", color: "1E3A5F", bold: true, font: "Arial", size: 28 })],
      })
    );

    // Footer
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Glory Global Solutions (Colombia) SAS, Registered Office: Av. Cra. 7 # 113-43 Oficina 807 Torre Samsung. Bogotá D.C, Colombia.",
              size: 14,
              font: "Arial",
              color: "888888",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Registered in Colombia and NIT No: 900.254.658-0 Glory Global Solutions is part of GLORY Ltd.",
              size: 14,
              font: "Arial",
              color: "888888",
            }),
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
    const fileName = `Cotizacion_Cliente_${workflow.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "_")}.docx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error("Error generating client document:", error);
    return NextResponse.json({ error: "Failed to generate client document" }, { status: 500 });
  }
}
