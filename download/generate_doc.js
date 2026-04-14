const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, SectionType, TableOfContents, LevelFormat,
  TableLayoutType,
} = require("docx");
const fs = require("fs");

// ── Palette: Apple Blue ──
const P = {
  bg: "0A1628", primary: "FFFFFF", accent: "007AFF",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0C4DE", metaColor: "8FA8C8", footerColor: "5A7A9A" },
  body: "1A1A2E", heading: "0A1628", secondary: "506080",
  table: { headerBg: "007AFF", headerText: "FFFFFF", accentLine: "007AFF", innerLine: "D0E0F0", surface: "F0F6FF" },
};

const c = (hex) => hex.replace("#", "");

// ── Border constants ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function emptyPara() {
  return new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "", size: 2 })] });
}

// ── calcTitleLayout ──
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([
    ...'，。、；：！？', ...'aeiouAEIOU ', ...'-_—–·/', ...' \t',
  ]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

// ── calcCoverSpacing ──
function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
  } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - SAFETY;
  const titleH = titleLineCount * (titlePt * 23 + 200);
  const subtitleH = hasSubtitle ? (12 * 23 + 200) : 0;
  const englishLabelH = hasEnglishLabel ? (9 * 23 + 500) : 0;
  const metaH = metaLineCount * 280;
  const totalContent = titleH + subtitleH + englishLabelH + metaH + fixedHeight;
  const remaining = usableHeight - totalContent;
  const topSpacing = Math.max(Math.floor(remaining * 0.45), 800);
  const midSpacing = Math.max(Math.floor(remaining * 0.15), 200);
  const bottomSpacing = Math.max(Math.floor(remaining * 0.4), 600);
  return { topSpacing, midSpacing, bottomSpacing };
}

// ── Build Cover R4 (Top Color Block) ──
function buildCoverR4(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR;

  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 38, 26);
  const titleSize = titlePt * 2;

  const titleBlockHeight = titleLines.length * (titlePt * 23 + 200);
  const englishLabelH = config.englishLabel ? (9 * 23 + 500) : 0;
  const subtitleH = config.subtitle ? (12 * 23 + 200) : 0;
  const upperContentH = englishLabelH + titleBlockHeight + subtitleH;
  const UPPER_MIN = 7500;
  const UPPER_H = Math.max(UPPER_MIN, upperContentH + 1500 + 800);
  const DIVIDER_H = 60;

  const contentEstimate = englishLabelH + titleLines.length * (titlePt * 23 + 200) + subtitleH;
  const spacerIntrinsic = 280;
  const topSpacing = Math.max(UPPER_H - contentEstimate - spacerIntrinsic - 800, 400);

  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: P.bg }, borders: noBorders,
        verticalAlign: "top",
        margins: { left: padL, right: padR },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          config.englishLabel ? new Paragraph({
            spacing: { after: 500 },
            children: [new TextRun({ text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })],
          }) : null,
          ...titleLines.map((line, i) => new Paragraph({
            spacing: { after: i < titleLines.length - 1 ? 100 : 200, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
            children: [new TextRun({ text: line, size: titleSize, bold: true,
              color: P.titleColor, font: { eastAsia: "Calibri", ascii: "Calibri" } })],
          })),
          config.subtitle ? new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
              font: { eastAsia: "Calibri", ascii: "Calibri" } })],
          }) : null,
        ].filter(Boolean),
      })],
    })],
  });

  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ borders: noBorders,
        shading: { fill: P.accent }, children: [emptyPara()] })],
    })],
  });

  const lowerContent = [
    new Paragraph({ spacing: { before: 800 } }),
    ...(config.metaLines || []).map(line => new Paragraph({
      indent: { left: padL }, spacing: { after: 100 },
      children: [new TextRun({ text: line, size: 28, color: P.metaColor,
        font: { eastAsia: "Calibri", ascii: "Calibri" } })],
    })),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      indent: { left: padL },
      children: [
        new TextRun({ text: config.footerLeft || "", size: 22, color: "909090" }),
        new TextRun({ text: "          " }),
        new TextRun({ text: config.footerRight || "", size: 22, color: "909090" }),
      ],
    }),
  ];

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { fill: "FFFFFF" }, borders: noBorders,
        verticalAlign: "top",
        children: [upperBlock, divider, ...lowerContent],
      })],
    })],
  })];
}

// ── Helpers ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.heading),
      font: { ascii: "Calibri", eastAsia: "Calibri" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.heading),
      font: { ascii: "Calibri", eastAsia: "Calibri" } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "Calibri" } })],
  });
}

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), bold: true,
      font: { ascii: "Calibri", eastAsia: "Calibri" } })],
  });
}

function accentBody(boldText, normalText) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text: boldText, size: 24, color: c(P.accent), bold: true,
        font: { ascii: "Calibri", eastAsia: "Calibri" } }),
      new TextRun({ text: normalText, size: 24, color: c(P.body),
        font: { ascii: "Calibri", eastAsia: "Calibri" } }),
    ],
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}

// ── Table builder ──
function makeHeaderCell(text, widthPct) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
    borders: noBorders,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 21, color: P.table.headerText,
        font: { ascii: "Calibri", eastAsia: "Calibri" } })],
    })],
  });
}

function makeDataCell(text, widthPct, idx = 0) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? P.table.surface : "FFFFFF" },
    borders: noBorders,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 21, color: c(P.body),
        font: { ascii: "Calibri", eastAsia: "Calibri" } })],
    })],
  });
}

function makeTable(headers, rows, colWidths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((h, i) => makeHeaderCell(h, colWidths[i])),
      }),
      ...rows.map((row, idx) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, i) => makeDataCell(cell, colWidths[i], idx)),
        })
      ),
    ],
  });
}

// ── Content Sections ──

// 1. Resumen Ejecutivo
function resumenEjecutivo() {
  return [
    h1("Resumen Ejecutivo"),
    body("Glory Service Workflow es una plataforma SaaS dise\u00f1ada para transformar la gesti\u00f3n de formatos de servicio en organizaciones que requieren la coordinaci\u00f3n de m\u00faltiples departamentos. En un entorno empresarial donde la informaci\u00f3n se distribuye entre diversas \u00e1reas funcionales, centralizar la recolecci\u00f3n, validaci\u00f3n y consolidaci\u00f3n de datos se convierte en un desaf\u00edo cr\u00edtico."),
    body("La plataforma implementa un modelo de flujo de trabajo Hub & Spoke, donde la Ejecutiva de Cuenta act\u00faa como nodo central que orquesta la recopilaci\u00f3n de informaci\u00f3n entre seis dependencias especializadas: Financiera, Operaciones, Jur\u00eddica, Tecnolog\u00eda, Cadena de Suministro y Soporte de Servicio. Este enfoque permite una gesti\u00f3n eficiente, trazable y controlada de cada formato de servicio, desde su recepci\u00f3n inicial hasta la generaci\u00f3n del documento final completamente diligenciado."),
    body("El presente documento de negocio describe el problema que resuelve la plataforma, la soluci\u00f3n tecnol\u00f3gica propuesta, las caracter\u00edsticas principales, el modelo de negocio SaaS, la propuesta de valor diferencial y el plan de implementaci\u00f3n recomendado."),
  ];
}

// 2. El Problema
function elProblema() {
  return [
    h1("El Problema"),
    h2("Desaf\u00edo de Centralizaci\u00f3n de Informaci\u00f3n"),
    body("En las organizaciones de servicio, la atenci\u00f3n a clientes requiere recopilar informaci\u00f3n detallada de m\u00faltiples \u00e1reas funcionales. Un formato de servicio puede contener datos financieros, operativos, legales, tecnol\u00f3gicos, log\u00edsticos y de soporte. Sin embargo, esta informaci\u00f3n rara vez reside en un solo departamento, lo que genera desaf\u00edos significativos en la coordinaci\u00f3n y consolidaci\u00f3n de datos."),
    h2("Ineficiencias del Modelo Actual"),
    body("Los procesos manuales de recolecci\u00f3n de informaci\u00f3n presentan m\u00faltiples problemas que afectan directamente la calidad del servicio y la satisfacci\u00f3n del cliente:"),
    accentBody("Tiempos de respuesta prolongados: ", "La b\u00fasqueda de informaci\u00f3n en diferentes departamentos puede tardar d\u00edas o incluso semanas, retrasando la entrega del formato diligenciado al cliente."),
    accentBody("Falta de trazabilidad: ", "No existe un registro claro de qui\u00e9n tiene el formato, qu\u00e9 informaci\u00f3n se ha solicitado y cu\u00e1ndo se espera recibir cada respuesta."),
    accentBody("Informaci\u00f3n inconsistente: ", "Sin un formato estandarizado y un proceso centralizado, los datos proporcionados por cada departamento pueden ser incompatibles o contradictorios."),
    accentBody("Riesgo de p\u00e9rdida de formatos: ", "Los correos electr\u00f3nicos y hojas de c\u00e1lculo compartidas son propensas a perderse, duplicarse o sobreescribirse accidentalmente."),
    accentBody("Dependencia de personas clave: ", "Cuando un empleado clave est\u00e1 ausente, todo el proceso se detiene porque la informaci\u00f3n y los contactos residen en su conocimiento individual."),
    h2("Impacto en el Negocio"),
    body("Estas ineficiencias se traducen en costos operativos elevados, insatisfacci\u00f3n del cliente por tiempos de respuesta extendidos, errores en la informaci\u00f3n entregada y una incapacidad para escalar el volumen de servicio sin incrementar proporcionalmente el personal. La falta de un sistema centralizado impide adem\u00e1s obtener m\u00e9tricas de rendimiento y \u00e1reas de mejora en el proceso de atenci\u00f3n."),
  ];
}

// 3. La Soluci\u00f3n
function laSolucion() {
  return [
    h1("La Soluci\u00f3n - Modelo Hub & Spoke"),
    h2("Arquitectura del Flujo de Trabajo"),
    body("Glory Service Workflow resuelve estos desaf\u00edos mediante un modelo de flujo de trabajo Hub & Spoke (Centro y Radios), donde la Ejecutiva de Cuenta opera como el centro (hub) que coordina la recopilaci\u00f3n de informaci\u00f3n desde m\u00faltiples dependencias (spokes). Este modelo garantiza que toda la informaci\u00f3n pase por un punto de control centralizado, asegurando consistencia, trazabilidad y calidad."),
    h2("Componentes del Modelo"),
    makeTable(
      ["Componente", "Rol", "Responsabilidad"],
      [
        ["Dispatcher", "Punto de entrada", "Recibe el formato por correo electr\u00f3nico, lo carga al sistema y lo asigna a la Ejecutiva de Cuenta"],
        ["Ejecutiva de Cuenta", "Hub central", "Llena la informaci\u00f3n disponible, identifica datos faltantes y escala a las dependencias necesarias"],
        ["Dependencias", "Spokes especializados", "Reciben solicitudes de informaci\u00f3n, llenan sus campos espec\u00edficos y devuelven el formato al Hub"],
      ],
      [25, 25, 50]
    ),
    spacer(),
    h2("Flujo de Trabajo Detallado"),
    accentBody("Paso 1 - Recepci\u00f3n: ", "El Dispatcher recibe el formato de servicio a trav\u00e9s de correo electr\u00f3nico, lo carga en la plataforma y lo asigna autom\u00e1ticamente a la Ejecutiva de Cuenta correspondiente."),
    accentBody("Paso 2 - Diligenciamiento inicial: ", "La Ejecutiva de Cuenta revisa el formato y completa toda la informaci\u00f3n que tiene disponible con su conocimiento del cliente y del servicio."),
    accentBody("Paso 3 - Escalamiento: ", "Si informaci\u00f3n est\u00e1 incompleta, la Ejecutiva de Cuenta identifica qu\u00e9 dependencias pueden proveer los datos faltantes y escala el formato simult\u00e1neamente a una o varias dependencias."),
    accentBody("Paso 4 - Respuesta de dependencias: ", "Cada dependencia recibe la solicitud, completa los campos de su competencia y devuelve el formato a la Ejecutiva de Cuenta. Este proceso puede ocurrir en paralelo entre m\u00faltiples dependencias."),
    accentBody("Paso 5 - Consolidaci\u00f3n: ", "La Ejecutiva de Cuenta recibe las respuestas de todas las dependencias, integra la informaci\u00f3n en un formato consolidado y verifica la completitud de todos los campos requeridos."),
    accentBody("Paso 6 - Entrega final: ", "Una vez que el formato est\u00e1 completamente diligenciado, se genera autom\u00e1ticamente un documento Word con toda la informaci\u00f3n consolidada, listo para su descarga y entrega al cliente."),
    h2("Las Seis Dependencias"),
    body("El sistema contempla seis dependencias especializadas, cada una responsable de un \u00e1rea espec\u00edfica de informaci\u00f3n dentro del formato de servicio:"),
    makeTable(
      ["Dependencia", "\u00c1rea de Competencia", "Tipo de Informaci\u00f3n"],
      [
        ["Financiera", "Datos econ\u00f3micos", "Costos, presupuestos, facturaci\u00f3n, condiciones de pago"],
        ["Operaciones", "Procesos operativos", "Capacidad operativa, tiempos de entrega, recursos asignados"],
        ["Jur\u00eddica", "Aspectos legales", "Contratos, normatividad, cumplimiento regulatorio"],
        ["Tecnolog\u00eda", "Infraestructura t\u00e9cnica", "Sistemas, integraciones, requisitos t\u00e9cnicos"],
        ["Cadena de Suministro", "Log\u00edstica y aprovisionamiento", "Disponibilidad de insumos, proveedores, tiempos de entrega"],
        ["Soporte de Servicio", "Atenci\u00f3n al cliente", "Niveles de servicio, historial de atenci\u00f3n, requerimientos especiales"],
      ],
      [22, 28, 50]
    ),
    spacer(),
    h2("Ventajas del Modelo Hub & Spoke"),
    accentBody("Escalabilidad controlada: ", "La Ejecutiva de Cuenta puede escalar a m\u00faltiples dependencias simult\u00e1neamente, reduciendo significativamente el tiempo total de procesamiento."),
    accentBody("Punto \u00fanico de control: ", "Toda la informaci\u00f3n pasa por la Ejecutiva de Cuenta, lo que garantiza consistencia y calidad en los datos finales."),
    accentBody("Trazabilidad completa: ", "El sistema registra cada acci\u00f3n: qui\u00e9n recibi\u00f3 el formato, cu\u00e1ndo se escal\u00f3, qu\u00e9 respondi\u00f3 cada dependencia y cu\u00e1ndo se complet\u00f3."),
    accentBody("Flexibilidad: ", "No todos los formatos requieren informaci\u00f3n de todas las dependencias. La Ejecutiva de Cuenta decide din\u00e1micamente a cu\u00e1les escalar seg\u00fan las necesidades del caso espec\u00edfico."),
  ];
}

// 4. Caracter\u00edsticas Principales
function caracteristicas() {
  return [
    h1("Caracter\u00edsticas Principales"),
    h2("Gesti\u00f3n Centralizada Hub & Spoke"),
    body("La plataforma implementa el modelo Hub & Spoke donde la Ejecutiva de Cuenta gestiona centralmente todos los formatos de servicio. Desde un panel \u00fanico, puede ver el estado de cada formato, identificar cu\u00e1les requieren escalamiento y realizar seguimiento en tiempo real de las respuestas de cada dependencia."),
    h2("Escalamiento Inteligente"),
    body("El sistema permite escalar un formato a una o m\u00faltiples dependencias de forma simult\u00e1nea. La Ejecutiva de Cuenta selecciona las dependencias requeridas, a\u00f1ade instrucciones espec\u00edficas para cada una y env\u00eda la solicitud con un solo clic. Cada dependencia recibe \u00fanicamente los campos que le corresponden, manteniendo la privacidad y relevancia de la informaci\u00f3n."),
    h2("Flujo de Retorno Automatizado"),
    body("Una vez que una dependencia completa su informaci\u00f3n, el formato regresa autom\u00e1ticamente a la Ejecutiva de Cuenta. El sistema notifica en tiempo real cada respuesta recibida y actualiza el estado del formato. La Ejecutiva de Cuenta puede ver qu\u00e9 dependencias han respondido y cu\u00e1les est\u00e1n pendientes, permitiendo enviar recordatorios oportunos."),
    h2("Generaci\u00f3n de Documentos Word"),
    body("Cuando el formato est\u00e1 completamente diligenciado, la plataforma genera autom\u00e1ticamente un documento Word profesional con toda la informaci\u00f3n consolidada. El documento mantiene el formato y la estructura del template original, con todos los campos completos y listo para su descarga y entrega al cliente."),
    h2("Trazabilidad y Auditor\u00eda"),
    body("Cada acci\u00f3n realizada sobre un formato queda registrada en un historial completo: qui\u00e9n lo carg\u00f3, cu\u00e1ndo se asign\u00f3, qu\u00e9 dependencias fueron escaladas, cu\u00e1ndo respondieron, qu\u00e9 informaci\u00f3n proporcionaron y cu\u00e1ndo se complet\u00f3. Este registro permite auditor\u00edas, an\u00e1lisis de rendimiento e identificaci\u00f3n de cuellos de botella."),
    h2("Notificaciones en Tiempo Real"),
    body("El sistema env\u00eda notificaciones autom\u00e1ticas por correo electr\u00f3nico cuando un formato es asignado, escalado, respondido o completado. Esto asegura que todos los participantes est\u00e9n informados del estado actual sin necesidad de consultar manualmente la plataforma."),
    h2("Panel de Control y M\u00e9tricas"),
    body("Los administradores disponen de un panel de control con m\u00e9tricas clave: n\u00famero de formatos en proceso, tiempos promedio de respuesta por dependencia, formatos completados por per\u00edodo y alertas sobre formatos que exceden los tiempos establecidos."),
  ];
}

// 5. Modelo de Negocio
function modeloNegocio() {
  return [
    h1("Modelo de Negocio"),
    h2("Suscripci\u00f3n SaaS"),
    body("Glory Service Workflow se comercializa bajo un modelo de suscripci\u00f3n SaaS (Software as a Service), lo que permite a las organizaciones acceder a la plataforma sin inversiones iniciales en infraestructura. El modelo se estructura en planes escalables que se adaptan al tama\u00f1o y necesidades de cada organizaci\u00f3n."),
    h2("Planes y Precios"),
    makeTable(
      ["Caracter\u00edstica", "Plan B\u00e1sico", "Plan Profesional", "Plan Enterprise"],
      [
        ["Ejecutivas de Cuenta", "1", "5", "Ilimitadas"],
        ["Dependencias", "3", "6", "Personalizadas"],
        ["Formatos por mes", "50", "500", "Ilimitados"],
        ["Historial de formatos", "3 meses", "12 meses", "Ilimitado"],
        ["Panel de control", "B\u00e1sico", "Avanzado", "Premium"],
        ["Integraciones", "Correo electr\u00f3nico", "API + Correo", "API + Webhooks + ERP"],
        ["Soporte", "Email", "Email + Chat", "Dedicado 24/7"],
      ],
      [25, 25, 25, 25]
    ),
    spacer(),
    h2("Fuentes de Ingreso"),
    accentBody("Suscripciones mensuales: ", "Ingreso recurrente principal basado en el plan seleccionado por cada organizaci\u00f3n."),
    accentBody("Cargos por formatos adicionales: ", "Cuando una organizaci\u00f3n excede el l\u00edmite de formatos de su plan, puede adquirir paquetes adicionales."),
    accentBody("Servicios de implementaci\u00f3n: ", "Consultor\u00eda personalizada para la configuraci\u00f3n inicial, integraci\u00f3n con sistemas existentes y capacitaci\u00f3n del equipo."),
    accentBody("Personalizaci\u00f3n avanzada: ", "Desarrollo de funcionalidades espec\u00edficas o adaptaciones del flujo de trabajo para clientes con necesidades particulares."),
    h2("Econom\u00eda Unidad"),
    body("El costo de servir a un cliente decrece conforme madura su uso de la plataforma. Los costos principales son infraestructura cloud y soporte t\u00e9cnico, ambos escalables. Se estima que un cliente promedio genera entre 100 y 300 formatos mensuales, con un costo marginal por formato inferior al 5% del valor de la suscripci\u00f3n."),
  ];
}

// 6. Propuesta de Valor
function propuestaValor() {
  return [
    h1("Propuesta de Valor"),
    h2("Reducci\u00f3n de Tiempos de Respuesta"),
    body("El modelo Hub & Spoke permite escalamientos paralelos a m\u00faltiples dependencias simult\u00e1neamente, reduciendo los tiempos de procesamiento de formatos de semanas a d\u00edas. Las notificaciones autom\u00e1ticas y los recordatorios mantienen el flujo activo, eliminando los retrasos causados por la falta de seguimiento manual."),
    h2("Calidad y Consistencia"),
    body("Al centralizar la consolidaci\u00f3n en la Ejecutiva de Cuenta, se garantiza que toda la informaci\u00f3n sea revisada y validada antes de su entrega. Los formatos estandarizados eliminan las inconsistencias entre departamentos y aseguran que cada documento final cumpla con los est\u00e1ndares de calidad requeridos."),
    h2("Visibilidad y Control"),
    body("La trazabilidad completa del proceso permite a los gerentes y supervisores conocer en tiempo real el estado de cada formato, identificar cuellos de botella y tomar decisiones informadas. Las m\u00e9tricas del panel de control facilitan la gesti\u00f3n basada en datos y la mejora continua del proceso."),
    h2("Independencia de Personas Clave"),
    body("El sistema almacena toda la informaci\u00f3n, contactos y reglas de escalamiento en la plataforma, no en el conocimiento individual de los empleados. Esto significa que la operaci\u00f3n puede continuar sin interrupciones independientemente de la disponibilidad del personal."),
    h2("Escalabilidad"),
    body("El modelo SaaS permite agregar nuevas dependencias, ejecutivas de cuenta y vol\u00famenes de formato sin cambios en la infraestructura. Una organizaci\u00f3n puede crecer de 3 a 20 dependencias simplemente actualizando su plan de suscripci\u00f3n."),
  ];
}

// 7. Plan de Implementaci\u00f3n
function planImplementacion() {
  return [
    h1("Plan de Implementaci\u00f3n"),
    h2("Fase 1: Configuraci\u00f3n Inicial (Semanas 1-2)"),
    body("La primera fase se centra en establecer la infraestructura base de la plataforma para la organizaci\u00f3n cliente. Incluye la creaci\u00f3n de la cuenta, configuraci\u00f3n de las dependencias, carga de templates de formatos y definici\u00f3n de las reglas de escalamiento espec\u00edficas del cliente."),
    h2("Fase 2: Capacitaci\u00f3n (Semanas 3-4)"),
    body("Entrenamiento de la Ejecutiva de Cuenta en el uso de la plataforma, incluyendo gesti\u00f3n de formatos, escalamiento a dependencias, revisi\u00f3n de respuestas y generaci\u00f3n de documentos finales. Tambi\u00e9n se capacita a las dependencias en el proceso de recepci\u00f3n, diligenciamiento y retorno de formatos."),
    h2("Fase 3: Piloto (Semanas 5-8)"),
    body("Ejecuci\u00f3n de un piloto con un grupo reducido de formatos de servicio para validar el flujo Hub & Spoke, identificar ajustes necesarios y medir los tiempos de respuesta reales. Durante esta fase se realizan iteraciones r\u00e1pidas para optimizar el proceso."),
    h2("Fase 4: Despliegue Completo (Semanas 9-10)"),
    body("Activaci\u00f3n de la plataforma para todos los formatos y dependencias de la organizaci\u00f3n. Migraci\u00f3n de cualquier proceso existente al nuevo sistema y configuraci\u00f3n de integraciones con sistemas de correo electr\u00f3nico y otras herramientas operativas."),
    h2("Fase 5: Optimizaci\u00f3n Continua (Mes 3 en adelante)"),
    body("Revisi\u00f3n peri\u00f3dica de m\u00e9tricas de rendimiento, ajuste de reglas de escalamiento seg\u00fan patrones observados y adici\u00f3n de nuevas funcionalidades basadas en las necesidades del cliente. Se establece un ciclo trimestral de revisi\u00f3n y mejora."),
    spacer(),
    makeTable(
      ["Fase", "Duraci\u00f3n", "Entregable Principal"],
      [
        ["Configuraci\u00f3n Inicial", "Semanas 1-2", "Plataforma configurada y templates cargados"],
        ["Capacitaci\u00f3n", "Semanas 3-4", "Personal entrenado y documentado"],
        ["Piloto", "Semanas 5-8", "Resultados validados con m\u00e9tricas reales"],
        ["Despliegue Completo", "Semanas 9-10", "Operaci\u00f3n en producci\u00f3n"],
        ["Optimizaci\u00f3n Continua", "Mes 3+", "Informe de rendimiento y mejoras"],
      ],
      [30, 25, 45]
    ),
  ];
}

// 8. Conclusiones
function conclusiones() {
  return [
    h1("Conclusiones"),
    body("Glory Service Workflow representa una soluci\u00f3n integral para la gesti\u00f3n de formatos de servicio en organizaciones que requieren la coordinaci\u00f3n de m\u00faltiples departamentos. El modelo Hub & Spoke, con la Ejecutiva de Cuenta como centro de operaciones, ofrece una alternativa eficiente y escalable a los procesos manuales actuales."),
    body("La plataforma no solo automatiza la recolecci\u00f3n y consolidaci\u00f3n de informaci\u00f3n, sino que proporciona trazabilidad completa, tiempos de respuesta significativamente reducidos y calidad consistente en cada formato entregado. El modelo SaaS garantiza accesibilidad, escalabilidad y un retorno de inversi\u00f3n r\u00e1pido para las organizaciones que lo implementan."),
    body("Con un plan de implementaci\u00f3n estructurado en cinco fases, las organizaciones pueden adoptar la plataforma de forma progresiva, minimizando el riesgo y maximizando el valor obtenido desde las primeras semanas de operaci\u00f3n. La propuesta de valor se sustenta en la reducci\u00f3n de costos operativos, la mejora en la satisfacci\u00f3n del cliente y la independencia de conocimientos individuales para la operaci\u00f3n del servicio."),
    body("Glory Service Workflow est\u00e1 preparado para convertirse en la herramienta est\u00e1ndar de gesti\u00f3n de formatos de servicio, impulsando la eficiencia operativa y la excelencia en la atenci\u00f3n al cliente."),
  ];
}

// ── Main Document Assembly ──
async function main() {
  const coverConfig = {
    title: "Glory Service Workflow",
    subtitle: "Documento de Negocio - Modelo Hub & Spoke",
    englishLabel: "BUSINESS DOCUMENT",
    metaLines: [
      "Plataforma SaaS de Gesti\u00f3n de Flujos de Servicio",
      "Modelo Hub & Spoke con Ejecutiva de Cuenta como Centro",
      "Versi\u00f3n 2.0",
    ],
    footerLeft: "Confidencial",
    footerRight: "2025",
    palette: {
      bg: P.bg,
      titleColor: P.cover.titleColor,
      subtitleColor: P.cover.subtitleColor,
      metaColor: P.cover.metaColor,
      accent: P.accent,
      footerColor: P.cover.footerColor,
    },
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Calibri", eastAsia: "Calibri" },
            size: 24,
            color: c(P.body),
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: { font: { ascii: "Calibri", eastAsia: "Calibri" }, size: 32, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 360, after: 160, line: 312 } },
        },
        heading2: {
          run: { font: { ascii: "Calibri", eastAsia: "Calibri" }, size: 28, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 240, after: 120, line: 312 } },
        },
        heading3: {
          run: { font: { ascii: "Calibri", eastAsia: "Calibri" }, size: 24, bold: true, color: c(P.heading) },
          paragraph: { spacing: { before: 200, after: 100, line: 312 } },
        },
      },
    },
    sections: [
      // ── Section 1: Cover ──
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCoverR4(coverConfig),
      },
      // ── Section 2: TOC (Front matter, Roman numerals) ──
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
            })],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            children: [new TextRun({
              text: "Tabla de Contenidos",
              bold: true, size: 32,
              font: { ascii: "Calibri", eastAsia: "Calibri" },
              color: c(P.heading),
            })],
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({
              text: "Nota: Esta Tabla de Contenidos se genera mediante c\u00f3digos de campo. Para garantizar la precisi\u00f3n de los n\u00fameros de p\u00e1gina despu\u00e9s de editar, haga clic derecho en la tabla y seleccione \"Actualizar campo\".",
              italics: true, size: 18, color: "888888",
            })],
          }),
          new Paragraph({ children: [new PageBreak()] }),
        ],
      },
      // ── Section 3: Body content (Arabic numerals, start at 1) ──
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
            })],
          }),
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Glory Service Workflow | Documento de Negocio", size: 16, color: c(P.secondary),
                font: { ascii: "Calibri", eastAsia: "Calibri" } })],
            })],
          }),
        },
        children: [
          ...resumenEjecutivo(),
          ...elProblema(),
          ...laSolucion(),
          ...caracteristicas(),
          ...modeloNegocio(),
          ...propuestaValor(),
          ...planImplementacion(),
          ...conclusiones(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/Glory_Service_Workflow_Documento_Negocio.docx", buffer);
  console.log("Document generated successfully!");
}

main().catch(err => { console.error(err); process.exit(1); });
