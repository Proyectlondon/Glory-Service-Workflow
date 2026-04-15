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
} from "docx";

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

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: workflow.name,
            bold: true,
            size: 36,
            color: "1E3A5F",
            font: "Calibri",
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Formato de Servicio - Estado: ${workflow.status === "COMPLETED" ? "COMPLETADO" : "EN PROGRESO"}`,
            size: 22,
            color: "007AFF",
            font: "Calibri",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Fecha de generación: ${new Date().toLocaleDateString("es-CO")}`,
            size: 20,
            color: "888888",
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "", break: 1 })],
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "1E3A5F" },
        },
        spacing: { after: 300 },
      })
    );

    for (const areaId of areas) {
      const areaFields = fieldsByArea.get(areaId);
      if (!areaFields || areaFields.length === 0) continue;

      const areaLabel = AREA_LABEL_MAP[areaId] || areaId;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `AREA: ${areaLabel}`,
              bold: true,
              size: 26,
              color: "FFFFFF",
              font: "Calibri",
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          shading: {
            type: ShadingType.SOLID,
            color: "1E3A5F",
            fill: "1E3A5F",
          },
          spacing: { before: 300, after: 200 },
        })
      );

      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Campo", bold: true, size: 20, font: "Calibri" })] })],
              shading: { type: ShadingType.SOLID, color: "E8EDF2", fill: "E8EDF2" },
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Valor", bold: true, size: 20, font: "Calibri" })] })],
              shading: { type: ShadingType.SOLID, color: "E8EDF2", fill: "E8EDF2" },
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true, size: 20, font: "Calibri" })] })],
              shading: { type: ShadingType.SOLID, color: "E8EDF2", fill: "E8EDF2" },
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ];

      for (const field of areaFields) {
        const hasValue = field.value && field.value.trim() !== "";
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: field.label,
                        size: 20,
                        font: "Calibri",
                        bold: field.required,
                      }),
                      field.required ? new TextRun({ text: " *", color: "CC0000", size: 20, font: "Calibri" }) : undefined,
                    ].filter(Boolean),
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: hasValue ? field.value : "(Sin diligenciar)",
                        size: 20,
                        font: "Calibri",
                        color: hasValue ? "000000" : "999999",
                        italics: !hasValue,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: hasValue ? "Diligenciado" : "Pendiente",
                        size: 18,
                        font: "Calibri",
                        color: hasValue ? "006600" : "CC6600",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }));
    }

    if (workflow.areaLogs.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "HISTORIAL DE FLUJO",
              bold: true,
              size: 26,
              color: "FFFFFF",
              font: "Calibri",
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          shading: { type: ShadingType.SOLID, color: "2C5F8A", fill: "2C5F8A" },
          spacing: { before: 300, after: 200 },
        })
      );

      for (const log of workflow.areaLogs) {
        const fromLabel = AREA_LABEL_MAP[log.fromArea] || log.fromArea;
        const toLabel = AREA_LABEL_MAP[log.toArea] || log.toArea;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[${new Date(log.createdAt).toLocaleString("es-CO")}] ${fromLabel} -> ${toLabel}`,
                size: 20,
                font: "Calibri",
                color: "444444",
              }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await doc.toBuffer();
    const fileName = `${workflow.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "_")}_completado.docx`;

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
