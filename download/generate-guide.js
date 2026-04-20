const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, AlignmentType, HeadingLevel,
  WidthType, BorderStyle, ShadingType, PageBreak, LevelFormat,
  TableOfContents, ExternalHyperlink,
} = require("docx");
const fs = require("fs");

// ─── Palette: CM-2 Blue Orange (tech/corporate) ───
const P = {
  primary: "1284BA", body: "1A1A2E", secondary: "5A6A7A", accent: "FF862F",
  surface: "EDF4F9", white: "FFFFFF", lightGray: "F8F9FA",
};
const c = (hex) => hex.replace("#", "");

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ─── Helpers ───
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, color: c(P.primary) })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, color: c(P.primary) })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, color: c(P.body) })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 480 }, spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) })],
  });
}

function boldBody(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 480 }, spacing: { line: 312 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) }),
      new TextRun({ text, size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) }),
    ],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 280 },
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    indent: { left: 360 },
    children: [new TextRun({ text, size: 20, font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" }, color: "334155" })],
  });
}

function empty() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}

function makeHeaderRow(cells) {
  return new TableRow({
    tableHeader: true, cantSplit: true,
    children: cells.map(text =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 21, font: { ascii: "Calibri" }, color: c(P.white) })] })],
        shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })
    ),
  });
}

function makeRow(cells, idx) {
  return new TableRow({
    cantSplit: true,
    children: cells.map(text =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, size: 21, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: c(P.body) })] })],
        shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.surface } : undefined,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(P.primary) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(P.primary) },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D8E8" },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [makeHeaderRow(headers), ...rows.map((r, i) => makeRow(r, i))],
  });
}

// ─── Cover ───
function buildCover() {
  const outer = new Table({
    borders: allNoBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      verticalAlign: "top",
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        children: [
          new Paragraph({ spacing: { before: 3600 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 200 },
            children: [new TextRun({ text: "Glory Service Workflow", bold: true, size: 52, font: { ascii: "Calibri" }, color: c(P.white) })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 100 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 15 } },
            indent: { left: 3000, right: 3000 },
            children: [],
          }),
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: "Gu\u00eda de Despliegue en Producci\u00f3n", size: 36, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: "B0C8E8" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 100 },
            children: [new TextRun({ text: "Usuarios reales, correos electr\u00f3nicos y configuraci\u00f3n profesional", size: 24, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, color: "8AAEC8" })],
          }),
          new Paragraph({ spacing: { before: 3000 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Documento T\u00e9cnico v1.0  |  Abril 2026", size: 20, font: { ascii: "Calibri" }, color: "6A8AAA" })],
          }),
        ],
      })],
    })],
  });
  return [outer];
}

// ─── Content Sections ───
const content = [];

// TOC
content.push(
  new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "Contenido", bold: true, size: 32, font: { ascii: "Calibri", eastAsia: "SimHei" }, color: c(P.primary) })],
  }),
  new TableOfContents("Tabla de Contenido", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ─── 1. Introducci\u00f3n ───
content.push(
  h1("1. Introducci\u00f3n"),
  body("Glory Service Workflow es una aplicaci\u00f3n de productividad empresarial dise\u00f1ada para gestionar flujos de trabajo entre m\u00faltiples \u00e1reas de una organizaci\u00f3n. El MVP actual funciona con SQLite como base de datos local, usuarios de demostraci\u00f3n y notificaciones internas. Este documento explica paso a paso c\u00f3mo llevar la aplicaci\u00f3n a un entorno de producci\u00f3n real, con usuarios autenticados, correo electr\u00f3nico funcional, almacenamiento en la nube y seguridad profesional."),
  body("El objetivo es que puedas tener la aplicaci\u00f3n accesible desde cualquier navegador, que cada persona de cada \u00e1rea reciba notificaciones reales por correo electr\u00f3nico cuando se le escala un formato, y que los archivos subidos como evidencia se guarden de forma segura y persistente. A continuaci\u00f3n se detalla cada paso necesario, desde la elecci\u00f3n de infraestructura hasta el monitoreo continuo."),
  empty(),

  h2("1.1 Estado Actual del MVP"),
  body("La aplicaci\u00f3n actual opera con las siguientes caracter\u00edsticas que deben ser migradas a producci\u00f3n: SQLite como base de datos local (ideal para desarrollo pero no para producci\u00f3n concurrente), contrase\u00f1as hasheadas con bcryptjs almacenadas en la base de datos local, tokens JWT generados con una clave fija hardcodeada, notificaciones que solo existen dentro de la interfaz de la aplicaci\u00f3n sin env\u00edo de correo real, archivos de evidencia guardados en la carpeta /public/uploads del servidor (que se pierden al redeplegar), y un servidor de desarrollo de Next.js que no est\u00e1 optimizado para tr\u00e1fico de producci\u00f3n."),
  empty(),

  h2("1.2 Objetivo del Despliegue"),
  body("Al finalizar los pasos descritos en esta gu\u00eda, la aplicaci\u00f3n contar\u00e1 con una base de datos PostgreSQL o MySQL en la nube con conexiones concurrentes seguras, un sistema de autenticaci\u00f3n robusto con JWT y claves seguras, notificaciones por correo electr\u00f3nico real enviadas autom\u00e1ticamente al escalar formatos entre \u00e1reas, almacenamiento persistente de evidencias en un servicio cloud como S3 o Cloudflare R2, un dominio personalizado con certificado SSL/HTTPS, y monitoreo b\u00e1sico de errores y rendimiento."),
);

// ─── 2. Infraestructura ───
content.push(
  h1("2. Infraestructura y Hosting"),
  body("El primer paso es elegir d\u00f3nde alojar la aplicaci\u00f3n. Existen varias opciones dependiendo del presupuesto, el nivel de control deseado y el conocimiento t\u00e9cnico del equipo. A continuaci\u00f3n se presentan las tres opciones m\u00e1s recomendadas con sus ventajas y desventajas para que puedas tomar una decisi\u00f3n informada."),
  empty(),

  h2("2.1 Opciones de Despliegue"),
  makeTable(
    ["Plataforma", "Costo Mensual", "Dificultad", "Ideal Para"],
    [
      ["Vercel", "Gratis - $20 USD", "Baja", "Despliegue r\u00e1pido, sin configuraci\u00f3n de servidor"],
      ["Railway", "$5 - $20 USD", "Baja - Media", "Base de datos incluida, despliegue con Git"],
      ["VPS (DigitalOcean/AWS)", "$5 - $40 USD", "Media - Alta", "Control total, escalabilidad, m\u00faltiples servicios"],
    ]
  ),
  empty(),
  body("Para la mayor\u00eda de los casos, se recomienda Railway como punto de partida porque incluye base de datos PostgreSQL, almacenamiento de archivos y despliegue autom\u00e1tico desde un repositorio de GitHub, todo en una sola plataforma con un costo accesible. Si necesitas m\u00e1s control o escalabilidad futura, un VPS en DigitalOcean o AWS Lightsail es la mejor opci\u00f3n a largo plazo."),
  empty(),

  h2("2.2 Dominio y SSL"),
  body("Para que la aplicaci\u00f3n sea accesible con una URL profesional (por ejemplo, workflow.tuempresa.com), necesitas un dominio registrado. Puedes adquirir dominios en proveedores como Namecheap, GoDaddy o Google Domains por aproximadamente $10-15 USD al a\u00f1o. Una vez tengas el dominio, debes configurar un registro DNS tipo A apuntando a la IP de tu servidor, o un registro CNAME apuntando al servicio de hosting si usas Vercel o Railway."),
  body("El certificado SSL (HTTPS) es obligatorio para la seguridad de la aplicaci\u00f3n, especialmente porque maneja autenticaci\u00f3n y contrase\u00f1as. La mayor\u00eda de las plataformas de hosting modernas (Vercel, Railway, Netlify) generan certificados SSL autom\u00e1ticamente a trav\u00e9s de Let's Encrypt. Si usas un VPS, puedes instalar Certbot para obtener y renovar certificados SSL gratuitos autom\u00e1ticamente con los siguientes comandos:"),
  code("sudo apt install certbot python3-certbot-nginx"),
  code("sudo certbot --nginx -d workflow.tuempresa.com"),
);

// ─── 3. Base de Datos ───
content.push(
  h1("3. Migraci\u00f3n de Base de Datos"),
  body("SQLite es excelente para desarrollo y pruebas, pero en producci\u00f3n necesitas una base de datos que soporte m\u00faltiples conexiones concurrentes, backups autom\u00e1ticos y better rendimiento bajo carga. Las opciones recomendadas son PostgreSQL (la m\u00e1s robusta y compatible con Prisma) o MySQL. PostgreSQL es la opci\u00f3n preferida porque Prisma tiene el mejor soporte para ella y es completamente gratuita."),
  empty(),

  h2("3.1 Configurar PostgreSQL"),
  body("Si usas Railway, puedes crear una base de datos PostgreSQL directamente desde el dashboard con un clic. Si usas un VPS, instala PostgreSQL con el siguiente proceso. Primero, instala el servidor de base de datos, luego crea el usuario y la base de datos dedicada para la aplicaci\u00f3n. Aseg\u00farate de configurar una contrase\u00f1a segura y de permitir conexiones locales. Finalmente, prueba la conexi\u00f3n para verificar que todo funciona correctamente."),
  code("sudo apt install postgresql postgresql-contrib"),
  code("sudo -u postgres createdb glory_workflow"),
  code("sudo -u postgres psql -c \"CREATE USER glory_admin WITH PASSWORD 'tu_contraseña_segura';\""),
  code("sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE glory_workflow TO glory_admin;\""),
  empty(),

  h2("3.2 Configurar Prisma para Producci\u00f3n"),
  body("Debes modificar el archivo de variables de entorno (.env.production) para apuntar a la nueva base de datos PostgreSQL. El formato de la URL de conexi\u00f3n de Prisma para PostgreSQL es el siguiente. Aseg\u00farate de reemplazar los valores placeholder con los datos reales de tu servidor de base de datos, incluyendo la contrase\u00f1a segura que configuraste en el paso anterior."),
  code("DATABASE_URL=\"postgresql://glory_admin:tu_contraseña@localhost:5432/glory_workflow?schema=public\""),
  body("Luego, actualiza el archivo prisma/schema.prisma para cambiar el proveedor de SQLite a PostgreSQL. La \u00fanica l\u00ednea que cambia es el provider en la secci\u00f3n datasource. Despu\u00e9s de este cambio, ejecuta los comandos de migraci\u00f3n de Prisma para crear las tablas en la nueva base de datos y generar el cliente actualizado."),
  code("// En prisma/schema.prisma, cambiar:"),
  code('provider = "sqlite"'),
  code("// por:"),
  code('provider = "postgresql"'),
  empty(),

  h2("3.3 Comandos de Migraci\u00f3n"),
  body("Una vez configurado el proveedor de base de datos, ejecuta los siguientes comandos en orden para crear la estructura de tablas en PostgreSQL. El primer comando aplica las migraciones a la base de datos, creando todas las tablas necesarias (Workflow, WorkflowField, User, Notification, AreaLog). El segundo comando regenera el cliente de Prisma con los tipos actualizados para que la aplicaci\u00f3n pueda comunicarse correctamente con PostgreSQL."),
  code("npx prisma migrate deploy"),
  code("npx prisma generate"),
  body("Si es la primera vez que migras, es posible que necesites crear la migraci\u00f3n inicial con npx prisma migrate dev --name init y luego ejecutar prisma migrate deploy en producci\u00f3n. Esto asegura que todas las tablas, \u00edndices y relaciones se creen correctamente en PostgreSQL."),
);

// ─── 4. Autenticaci\u00f3n ───
content.push(
  h1("4. Autenticaci\u00f3n y Usuarios Reales"),
  body("El sistema de autenticaci\u00f3n actual usa JWT (JSON Web Tokens) con una clave secreta hardcodeada. En producci\u00f3n, debes usar una clave secreta robusta y \u00fanica almacenada como variable de entorno, no en el c\u00f3digo fuente. Adem\u00e1s, debes implementar medidas de seguridad adicionales como expiraci\u00f3n de tokens, refresh tokens y protecci\u00f3n contra ataques de fuerza bruta."),
  empty(),

  h2("4.1 Configurar Variables de Entorno"),
  body("Crea un archivo .env.production con las siguientes variables cr\u00edticas. La clave JWT debe ser una cadena aleatoria de al menos 32 caracteres. Puedes generar una con el comando openssl rand -hex 32 en tu terminal. Nunca compartas este archivo ni lo subas a GitHub; agr\u00e9galo a tu archivo .gitignore si no lo est\u00e1 ya. Estas variables controlan la seguridad de toda la aplicaci\u00f3n, por lo que es fundamental que est\u00e9n protegidas correctamente."),
  code("JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria_de_32_caracteres"),
  code("DATABASE_URL=postgresql://user:pass@host:5432/dbname"),
  code("NEXT_PUBLIC_APP_URL=https://workflow.tuempresa.com"),
  code("EMAIL_FROM=noreply@tuempresa.com"),
  code("RESEND_API_KEY=re_tu_api_key_de_resend"),
  empty(),

  h2("4.2 Crear Usuarios Reales"),
  body("Para crear los usuarios reales que usar\u00e1n la aplicaci\u00f3n, puedes usar el endpoint de registro que ya est\u00e1 implementado en /api/auth/register, o el endpoint de administraci\u00f3n /api/auth/users. Cada usuario necesita un nombre, correo electr\u00f3nico real, contrase\u00f1a segura y el \u00e1rea a la que pertenece. Los correos deben ser los reales de cada persona en la organizaci\u00f3n, ya que ser\u00e1n el canal de notificaci\u00f3n cuando se escale un formato a su \u00e1rea."),
  empty(),

  h2("4.3 Creaci\u00f3n de Usuarios por API"),
  body("Primero, inicia sesi\u00f3n como administrador para obtener un token JWT. Luego, usa ese token para crear usuarios reales a trav\u00e9s de la API. Cada petici\u00f3n debe incluir el header Authorization con el token Bearer. El siguiente ejemplo muestra c\u00f3mo crear un usuario para la Ejecutiva de Cuenta usando curl desde la l\u00ednea de comandos. Repite este proceso para cada persona de cada \u00e1rea de la organizaci\u00f3n."),
  code("# 1. Login como admin para obtener token"),
  code("curl -X POST https://workflow.tuempresa.com/api/auth/login \\"),
  code('  -H "Content-Type: application/json" \\'),
  code('  -d \'{"email":"admin@tuempresa.com","password":"tu_contraseña"}\''),
  code(""),
  code("# 2. Crear usuario con el token obtenido"),
  code("curl -X POST https://workflow.tuempresa.com/api/auth/users \\"),
  code('  -H "Content-Type: application/json" \\'),
  code('  -H "Authorization: Bearer TU_TOKEN_AQUI" \\'),
  code('  -d \'{"name":"Mar\u00eda L\u00f3pez","email":"maria.lopez@tuempresa.com",'),
  code('       "password":"ContraseñaSegura123!","area":"EXECUTIVE_ACCOUNTANT"}\''),
  empty(),

  h2("4.4 Asignaci\u00f3n de \u00c1reas a Usuarios"),
  body("Cada usuario debe estar asignado a exactamente un \u00e1rea. La aplicaci\u00f3n usa esta asignaci\u00f3n para determinar qu\u00e9 flujos de trabajo puede ver y qu\u00e9 campos puede editar. La relaci\u00f3n es uno a uno: un usuario pertenece a una sola \u00e1rea. Los c\u00f3digos de \u00e1rea disponibles son los siguientes y deben usarse exactamente como se muestran al crear usuarios a trav\u00e9s de la API o la interfaz de administraci\u00f3n."),
  makeTable(
    ["C\u00f3digo de \u00c1rea", "Nombre Visible", "Descripci\u00f3n"],
    [
      ["DISPATCHER", "Dispatcher", "Recibe y registra formatos nuevos"],
      ["EXECUTIVE_ACCOUNTANT", "Ejecutiva de Cuenta", "Centro de operaciones, escala y recibe"],
      ["FINANCE", "Financiera", "Informaci\u00f3n financiera y facturaci\u00f3n"],
      ["OPERATIONS", "Operaciones", "Log\u00edstica y operaciones del servicio"],
      ["LEGAL", "Jur\u00eddica", "Aspectos legales y contractuales"],
      ["IT", "Tecnolog\u00eda", "Informaci\u00f3n t\u00e9cnica y sistemas"],
      ["SUPPLY_CHAIN", "Cadena de Suministro", "Proveedores e inventarios"],
      ["SERVICE_SUPPORT", "Soporte de Servicio", "Atenci\u00f3n al cliente"],
    ]
  ),
  empty(),

  h2("4.5 Buenas Pr\u00e1cticas de Contrase\u00f1as"),
  body("Exige a los usuarios que utilicen contrase\u00f1as de al menos 8 caracteres que combinen letras may\u00fasculas, min\u00fasculas, n\u00fameros y caracteres especiales. La aplicaci\u00f3n ya usa bcryptjs para hashear contrase\u00f1as antes de almacenarlas, lo cual es seguro. Sin embargo, en producci\u00f3n deber\u00edas considerar agregar validaci\u00f3n de fortaleza de contrase\u00f1a en el frontend antes del env\u00edo, implementar una pol\u00edtica de expiraci\u00f3n de tokens JWT de 24 horas con refresh tokens, y opcionalmente integrar autenticaci\u00f3n de dos factores (2FA) usando una librer\u00eda como otpauth para mayor seguridad."),
);

// ─── 5. Correo Electr\u00f3nico ───
content.push(
  h1("5. Notificaciones por Correo Electr\u00f3nico"),
  body("Este es uno de los pasos m\u00e1s importantes para la experiencia de producci\u00f3n. Cuando la Ejecutiva de Cuenta escala un formato a Finanzas, la persona responsable de Finanzas debe recibir un correo electr\u00f3nico real notific\u00e1ndole que tiene un formato pendiente. La aplicaci\u00f3n ya tiene la arquitectura preparada para esto; solo necesitas configurar un servicio de env\u00edo de correos."),
  empty(),

  h2("5.1 Opci\u00f3n Recomendada: Resend"),
  body("Resend es el servicio de correo m\u00e1s sencillo para aplicaciones Next.js. Ofrece 3,000 correos gratis al mes, lo cual es suficiente para la mayor\u00eda de las empresas peque\u00f1as y medianas. La configuraci\u00f3n toma menos de 10 minutos. Primero, crea una cuenta en resend.com y verifica tu dominio. Luego, obt\u00e9n tu API key y configura las variables de entorno en tu servidor de producci\u00f3n."),
  empty(),

  h2("5.2 Configuraci\u00f3n de Resend"),
  body("Para configurar Resend, sigue estos pasos. Primero instala el SDK de Resend en tu proyecto ejecutando npm install resend en la ra\u00edz del proyecto. Luego, agrega tu API key como variable de entorno. Despu\u00e9s, crea un archivo dedicado para el servicio de correo (por ejemplo, src/lib/email.ts) con la configuraci\u00f3n del cliente. Finalmente, actualiza las rutas API que generan notificaciones para que tambi\u00e9n env\u00eden correos electr\u00f3nicos."),
  code("npm install resend"),
  code(""),
  code("// src/lib/email.ts"),
  code("import { Resend } from 'resend';"),
  code("const resend = new Resend(process.env.RESEND_API_KEY);"),
  code(""),
  code("export async function sendNotificationEmail({"),
  code("  to, subject, message"),
  code("}: { to: string; subject: string; message: string }) {"),
  code("  await resend.emails.send({"),
  code("    from: process.env.EMAIL_FROM || 'noreply@tuempresa.com',"),
  code("    to,"),
  code("    subject,"),
  code("    html: `<div style='font-family:sans-serif;max-width:600px;margin:0 auto;"),
  code("      padding:20px;background:#f8fafc;border-radius:12px;'>"),
  code("      <div style='background:#007AFF;padding:16px;border-radius:8px;margin-bottom:16px;'>"),
  code("        <h2 style='color:white;margin:0;'>Glory Service Workflow</h2>"),
  code("      </div>"),
  code("      <p style='color:#1a1a2e;font-size:16px;'>${message}</p>"),
  code("      <a href='${process.env.NEXT_PUBLIC_APP_URL}' style='display:inline-block;"),
  code("        background:#007AFF;color:white;padding:12px 24px;border-radius:8px;"),
  code("        text-decoration:none;margin-top:16px;'>Ir a la aplicaci\u00f3n</a>"),
  code("    </div>`"),
  code("  });"),
  code("}"),
  empty(),

  h2("5.3 Integrar Correos en el Flujo de Escalamiento"),
  body("Debes actualizar la ruta API de advance (/api/workflows/[id]/advance/route.ts) para que, despu\u00e9s de crear la notificaci\u00f3n en la base de datos, tambi\u00e9n env\u00ede un correo electr\u00f3nico al usuario asignado al \u00e1rea destino. La l\u00edgica es: cuando se escala a un \u00e1rea, buscar el usuario asignado a esa \u00e1rea en la base de datos, obtener su correo electr\u00f3nico, y enviar un correo con los detalles del formato y un enlace directo a la aplicaci\u00f3n. El siguiente c\u00f3digo muestra c\u00f3mo integrar esta funcionalidad en la ruta existente."),
  code("// En /api/workflows/[id]/advance/route.ts, despu\u00e9s de crear la notificaci\u00f3n:"),
  code("const targetUser = await db.user.findFirst({"),
  code("  where: { area: targetArea, isActive: true }"),
  code("});"),
  code("if (targetUser && targetUser.email) {"),
  code("  await sendNotificationEmail({"),
  code("    to: targetUser.email,"),
  code("    subject: `Nuevo formato: ${workflow.name}`,"),
  code("    message: `${userName} te ha asignado el formato...`"),
  code("  });"),
  code("}"),
  empty(),

  h2("5.4 Verificar Dominio en Resend"),
  body("Para que los correos no lleguen como spam, debes verificar tu dominio en Resend. Esto implica agregar un registro TXT y un registro MX en la configuraci\u00f3n DNS de tu dominio. Resend te guiar\u00e1 paso a paso en su panel de control. El proceso typically toma entre 1 y 24 horas en propagarse completamente. Una vez verificado, todos los correos se enviar\u00e1n desde tu dominio profesional (noreply@tuempresa.com) lo que aumenta la deliverabilidad y la confianza de los destinatarios."),
  empty(),

  h2("5.5 Alternativas a Resend"),
  body("Si Resend no es suficiente para tus necesidades, existen otras opciones como SendGrid (100 correos gratis al d\u00eda, muy robusto para vol\u00famenes altos), Amazon SES (el m\u00e1s econ\u00f3mico a gran escala con $0.10 por cada 1,000 correos), Mailgun (popular para transaccionales), o Nodemailer con SMTP (gratuito si ya tienes un servidor de correo). Todas estas opciones son compatibles con la arquitectura actual y solo requieren cambiar la configuraci\u00f3n en el archivo src/lib/email.ts."),
);

// ─── 6. Almacenamiento ───
content.push(
  h1("6. Almacenamiento de Archivos"),
  body("Actualmente las evidencias (fotos y documentos) se guardan en la carpeta /public/uploads del servidor, lo cual no es persistente entre despliegues. En producci\u00f3n necesitas un servicio de almacenamiento de objetos (Object Storage) que guarde los archivos de forma persistente y los sirva a trav\u00e9s de URLs p\u00fablicas."),
  empty(),

  h2("6.1 Cloudflare R2 (Recomendado)"),
  body("Cloudflare R2 es la opci\u00f3n m\u00e1s econ\u00f3mica del mercado. No cobra por ancho de banda de salida (egress), lo cual reduce significativamente los costos en comparaci\u00f3n con Amazon S3. Ofrece 10 GB de almacenamiento gratis al mes y $0.015 por GB adicional. Para configurarlo, crea una cuenta en Cloudflare, habilita R2, crea un bucket llamado glory-uploads, y genera una API Key con permisos de lectura y escritura."),
  code("npm install @aws-sdk/client-s3"),
  code(""),
  code("// Variables de entorno"),
  code("R2_ACCOUNT_ID=tu_account_id_de_cloudflare"),
  code("R2_ACCESS_KEY_ID=tu_access_key_id"),
  code("R2_SECRET_ACCESS_KEY=tu_secret_access_key"),
  code("R2_BUCKET_NAME=glory-uploads"),
  code("R2_PUBLIC_URL=https://uploads.tuempresa.com"),
  empty(),

  h2("6.2 Implementar Subida de Archivos"),
  body("Debes crear un servicio de almacenamiento que suba archivos a R2 en lugar de guardarlos localmente. Actualiza el endpoint /api/upload-evidence/route.ts para usar el SDK de S3 compatible con R2. Cuando un usuario sube una evidencia, el archivo se env\u00eda directamente a R2 y se recibe una URL p\u00fablica que se almacena en la base de datos junto con el campo. De esta manera, los archivos sobreviven a reinicios del servidor y pueden servirse r\u00e1pidamente desde la CDN de Cloudflare."),
  body("La implementaci\u00f3n requiere instalar el SDK de AWS v3 para S3 (compatible con R2), configurar las credenciales como variables de entorno, y modificar el endpoint de subida para que use putObject de S3 en lugar de escribir al sistema de archivos local. La URL p\u00fablica del archivo se construye concatenando R2_PUBLIC_URL con la key del objeto almacenado."),
);

// ─── 7. Despliegue ───
content.push(
  h1("7. Despliegue de la Aplicaci\u00f3n"),
  body("Con la base de datos, autenticaci\u00f3n, correo y almacenamiento configurados, el paso final es desplegar la aplicaci\u00f3n en el servidor de producci\u00f3n. A continuaci\u00f3n se detallan los pasos para las dos opciones m\u00e1s comunes."),
  empty(),

  h2("7.1 Despliegue en Vercel (El m\u00e1s simple)"),
  body("Si elegiste Vercel, el proceso es extremadamente sencillo. Sube tu c\u00f3digo a un repositorio de GitHub, ve a vercel.com, importa el repositorio, configura las variables de entorno en el panel de Settings de Vercel, y haz clic en Deploy. Vercel detectar\u00e1 autom\u00e1ticamente que es una aplicaci\u00f3n Next.js y configurar\u00e1 todo por ti. Cada vez que hagas git push a la rama principal, Vercel redeployar\u00e1 autom\u00e1ticamente. Las variables de entorno se configuran en el dashboard de Vercel, no en un archivo .env."),
  empty(),

  h2("7.2 Despliegue en VPS con Docker (Recomendado para control total)"),
  body("Si prefieres un VPS, Docker es la mejor forma de gestionar el despliegue. Primero, crea un archivo Dockerfile en la ra\u00edz del proyecto que defina c\u00f3mo construir la imagen de la aplicaci\u00f3n. Luego, crea un archivo docker-compose.yml que defina los servicios necesarios: la aplicaci\u00f3n Next.js y la base de datos PostgreSQL. Esto permite levantar todo el entorno con un solo comando. A continuaci\u00f3n se muestran los archivos de configuraci\u00f3n necesarios."),
  code("# Dockerfile"),
  code("FROM node:20-alpine AS base"),
  code("FROM base AS deps"),
  code("WORKDIR /app"),
  code("COPY package.json bun.lock ./"),
  code("RUN npm install"),
  code("FROM base AS builder"),
  code("WORKDIR /app"),
  code("COPY --from=deps /app/node_modules ./node_modules"),
  code("COPY . ."),
  code("RUN npx prisma generate"),
  code("RUN npm run build"),
  code("FROM base AS runner"),
  code("WORKDIR /app"),
  code("ENV NODE_ENV=production"),
  code("COPY --from=builder /app/.next/standalone ./"),
  code("COPY --from=builder /app/.next/static ./.next/static"),
  code("COPY --from=builder /app/public ./public"),
  code("EXPOSE 3000"),
  code('CMD ["node", "server.js"]'),
  empty(),

  h2("7.3 Docker Compose"),
  body("El archivo docker-compose.yml orquestra m\u00faltiples contenedores. Necesitas un servicio para la aplicaci\u00f3n Next.js y otro para PostgreSQL. Las variables de entorno se configuran directamente en el archivo compose o en un archivo .env separado que se monta en el contenedor. Aseg\u00farate de configurar vol\u00famenes persistentes para la base de datos para que los datos no se pierdan si el contenedor se reinicia."),
  code("# docker-compose.yml"),
  code("version: '3.8'"),
  code("services:"),
  code("  app:"),
  code("    build: ."),
  code("    ports: ['3000:3000']"),
  code("    env_file: .env.production"),
  code("    depends_on: [db]"),
  code("  db:"),
  code("    image: postgres:16-alpine"),
  code("    environment:"),
  code("      POSTGRES_DB: glory_workflow"),
  code("      POSTGRES_USER: glory_admin"),
  code("      POSTGRES_PASSWORD: ${DB_PASSWORD}"),
  code("    volumes: ['pgdata:/var/lib/postgresql/data']"),
  code("volumes:"),
  code("  pgdata:"),
  empty(),

  h2("7.4 Comandos de Despliegue"),
  body("Una vez configurados los archivos Docker, el despliegue se reduce a unos pocos comandos. Primero, construye las im\u00e1genes con docker-compose build. Luego, ejecuta la aplicaci\u00f3n con docker-compose up -d en modo detached para que corra en segundo plano. Para aplicar las migraciones de la base de datos, ejecuta el comando de Prisma dentro del contenedor de la aplicaci\u00f3n. Finalmente, verifica que todo funcione correctamente accediendo a la URL de tu servidor en el puerto 3000."),
  code("docker-compose build"),
  code("docker-compose up -d"),
  code("docker-compose exec app npx prisma migrate deploy"),
  code("docker-compose logs -f app"),
  empty(),

  h2("7.5 Configurar Nginx como Proxy Inverso"),
  body("Nginx se encarga de recibir las peticiones HTTP/HTTPS en los puertos est\u00e1ndar (80/443) y redirigirlas a la aplicaci\u00f3n Next.js en el puerto 3000. Tambi\u00e9n gestiona la terminaci\u00f3n SSL y puede servir como balanceador de carga si necesitas m\u00faltiples instancias. La configuraci\u00f3n b\u00e1sica de Nginx para tu aplicaci\u00f3n incluye definir el server block, configurar el proxy_pass al puerto 3000 de la aplicaci\u00f3n, y habilitar WebSockets para el soporte en tiempo real de Next.js durante el desarrollo."),
  code("# /etc/nginx/sites-available/glory-workflow"),
  code("server {"),
  code("    listen 80;"),
  code("    server_name workflow.tuempresa.com;"),
  code("    return 301 https://$server_name$request_uri;"),
  code("}"),
  code("server {"),
  code("    listen 443 ssl http2;"),
  code("    server_name workflow.tuempresa.com;"),
  code("    ssl_certificate /etc/letsencrypt/live/workflow.tuempresa.com/fullchain.pem;"),
  code("    ssl_certificate_key /etc/letsencrypt/live/workflow.tuempresa.com/privkey.pem;"),
  code("    location / {"),
  code("        proxy_pass http://localhost:3000;"),
  code("        proxy_http_version 1.1;"),
  code("        proxy_set_header Upgrade $http_upgrade;"),
  code("        proxy_set_header Connection 'upgrade';"),
  code("        proxy_set_header Host $host;"),
  code("        proxy_set_header X-Real-IP $remote_addr;"),
  code("        proxy_cache_bypass $http_upgrade;"),
  code("    }"),
  code("}"),
);

// ─── 8. Seguridad ───
content.push(
  h1("8. Seguridad en Producci\u00f3n"),
  body("La seguridad es un aspecto cr\u00edtico que no debe tomarse a la ligera. A continuaci\u00f3n se describen las medidas de seguridad esenciales que debes implementar para proteger la aplicaci\u00f3n y los datos de los usuarios."),
  empty(),

  h2("8.1 Lista de Verificaci\u00f3n de Seguridad"),
  makeTable(
    ["Medida", "Prioridad", "Descripci\u00f3n"],
    [
      ["HTTPS obligatorio", "Cr\u00edtica", "Todo el tr\u00e1fico debe usar SSL/TLS"],
      ["Variables de entorno seguras", "Cr\u00edtica", "Nunca exponer secrets en el c\u00f3digo"],
      ["JWT con expiraci\u00f3n corta", "Alta", "Tokens de 24 horas m\u00e1ximo"],
      ["Rate limiting en API", "Alta", "Limitar peticiones por IP para prevenir ataques"],
      ["Validaci\u00f3n de entrada", "Alta", "Sanitizar todos los inputs del usuario"],
      ["CORS configurado", "Alta", "Solo permitir tu dominio"],
      ["Headers de seguridad", "Media", "Helmet.js para X-Frame-Options, CSP, etc."],
      ["Backups autom\u00e1ticos", "Media", "Backup diario de la base de datos"],
      ["Logs de auditor\u00eda", "Media", "Registrar acciones cr\u00edticas de usuarios"],
    ]
  ),
  empty(),

  h2("8.2 Configurar CORS"),
  body("Agrega o verifica la configuraci\u00f3n de CORS en tu aplicaci\u00f3n para que solo acepte peticiones desde tu dominio. En Next.js, puedes configurar esto en next.config.ts o en un middleware. Si usas la aplicaci\u00f3n directamente sin API externa, CORS no es un problema, pero si alguna vez construyes una API para clientes m\u00f3viles u otra aplicaci\u00f3n frontend, CORS ser\u00e1 esencial para la seguridad."),
  empty(),

  h2("8.3 Rate Limiting"),
  body("Implementa rate limiting en las rutas cr\u00edticas de autenticaci\u00f3n (login, register) para prevenir ataques de fuerza bruta. Puedes usar la librer\u00eda express-rate-limit adaptada para Next.js API routes. El objetivo es limitar a un m\u00e1ximo de 5 intentos de login por minuto por direcci\u00f3n IP, lo cual hace inviable un ataque de fuerza bruta sin bloquear a usuarios leg\u00edtimos que ocasionalmente olviden su contrase\u00f1a."),
  code("npm install rate-limiter-flexible"),
);

// ─── 9. Monitoreo ───
content.push(
  h1("9. Monitoreo y Mantenimiento"),
  body("Una vez en producci\u00f3n, necesitas monitorear la salud de la aplicaci\u00f3n para detectar y resolver problemas r\u00e1pidamente. Un sistema de monitoreo b\u00e1sico pero efectivo incluye tres pilares: monitoreo de uptime (saber si la aplicaci\u00f3n est\u00e1 respondiendo), monitoreo de errores (capturar excepciones no manejadas), y alertas autom\u00e1ticas (notificarte inmediatamente cuando algo falla)."),
  empty(),

  h2("9.1 Monitoreo con Uptime Robot (Gratis)"),
  body("Uptime Robot ofrece monitoreo gratuito de hasta 50 URLs con comprobaci\u00f3n cada 5 minutos. Te env\u00eda alertas por correo, Slack o SMS cuando tu aplicaci\u00f3n deja de responder. Simplemente crea una cuenta en uptimerobot.com, agrega la URL de tu aplicaci\u00f3n, y configura las notificaciones. Es la forma m\u00e1s r\u00e1pida y econ\u00f3mica de tener monitoreo b\u00e1sico de uptime."),
  empty(),

  h2("9.2 Captura de Errores con Sentry"),
  body("Sentry captura autom\u00e1ticamente todos los errores de JavaScript en el frontend y el backend de tu aplicaci\u00f3n Next.js. La integraci\u00f3n toma menos de 5 minutos. Instala el SDK de Sentry para Next.js con el siguiente comando. Luego, crea un archivo sentry.client.config.ts y sentry.server.config.ts con tu DSN (Data Source Name) que obtienes al crear un proyecto en sentry.io. Sentry ofrece 5,000 errores gratis al mes, lo cual es m\u00e1s que suficiente para la mayor\u00eda de las aplicaciones."),
  code("npx @sentry/wizard@latest -i nextjs"),
  empty(),

  h2("9.3 Backups Autom\u00e1ticos de Base de Datos"),
  body("Configura backups autom\u00e1ticos diarios de tu base de datos PostgreSQL. Si usas Railway, los backups se configuran desde el dashboard. Si usas un VPS, puedes crear un cron job que ejecute pg_dump diariamente y guarde el resultado en un almacenamiento externo. El siguiente script de ejemplo se puede agregar al crontab del servidor para ejecutar un backup completo cada d\u00eda a las 2 AM."),
  code("# Agregar al crontab con: crontab -e"),
  code("0 2 * * * pg_dump -U glory_admin glory_workflow | gzip > /backups/glory_$(date +\\%Y\\%m\\%d).sql.gz"),
  code(""),
  code("# Mantener solo los \u00faltimos 30 d\u00edas"),
  code("0 3 * * * find /backups -name '*.sql.gz' -mtime +30 -delete"),
);

// ─── 10. Resumen ───
content.push(
  h1("10. Resumen del Proceso"),
  body("El proceso completo de despliegue se puede resumir en los siguientes pasos ordenados. Cada paso depende de los anteriores, por lo que es importante seguir el orden indicado. Primero elige y configura la infraestructura de hosting (Vercel, Railway o VPS). Luego migra la base de datos a PostgreSQL y configura las variables de entorno. Crea los usuarios reales de cada \u00e1rea con sus correos electr\u00f3nicos. Configura el servicio de correo electr\u00f3nico (Resend) para notificaciones reales. Migra el almacenamiento de archivos a Cloudflare R2. Despliega la aplicaci\u00f3n con Docker o Vercel. Configura Nginx como proxy inverso con SSL. Implementa las medidas de seguridad. Y finalmente configura el monitoreo y los backups autom\u00e1ticos."),
  empty(),
  makeTable(
    ["Paso", "Acci\u00f3n", "Tiempo Estimado"],
    [
      ["1", "Elegir hosting y configurar dominio", "30 minutos"],
      ["2", "Migrar base de datos a PostgreSQL", "1 hora"],
      ["3", "Configurar variables de entorno", "15 minutos"],
      ["4", "Crear usuarios reales por \u00e1rea", "30 minutos"],
      ["5", "Configurar Resend para correos", "1 hora"],
      ["6", "Configurar Cloudflare R2 para archivos", "1 hora"],
      ["7", "Desplegar con Docker o Vercel", "1-2 horas"],
      ["8", "Configurar Nginx + SSL", "30 minutos"],
      ["9", "Implementar medidas de seguridad", "1 hora"],
      ["10", "Configurar monitoreo y backups", "30 minutos"],
      ["", "Total estimado", "6-8 horas"],
    ]
  ),
  empty(),
  body("Con estos pasos completados, tendr\u00e1s una aplicaci\u00f3n profesional, segura y funcional que notifica por correo electr\u00f3nico a cada persona responsable cuando se le escala un formato, almacena evidencias de forma persistente, y est\u00e1 protegida con las mejores pr\u00e1cticas de seguridad. La aplicaci\u00f3n estar\u00e1 lista para uso real en tu organizaci\u00f3n."),
);

// ─── Build Document ───
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 400, after: 200, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 300, after: 150, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.body) },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    // Cover
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCover(),
    },
    // TOC
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
        page: { pageNumbers: { start: 1, formatType: "UPPER_ROMAN" } },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
          })],
        }),
      },
      children: content,
    },
    // Body
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: "DECIMAL" },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Glory Service Workflow | Gu\u00eda de Producci\u00f3n", size: 16, color: c(P.secondary), font: { ascii: "Calibri" } })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
          })],
        }),
      },
      children: [],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/home/z/my-project/download/Glory_Service_Workflow_Guia_Produccion.docx", buffer);
  console.log("Document generated successfully!");
});
