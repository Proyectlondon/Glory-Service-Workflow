export const AREAS = [
  {
    id: "DISPATCHER",
    label: "Dispatcher",
    icon: "Mail",
    color: "#6B7280",
    description: "Recibe el correo con el formato y lo registra en el sistema",
    type: "start" as const,
  },
  {
    id: "EXECUTIVE_ACCOUNTANT",
    label: "Ejecutiva de Cuenta",
    icon: "UserCheck",
    color: "#007AFF",
    description: "Procesa el formato, llena lo posible y escala a dependencias si falta info",
    type: "hub" as const,
  },
  {
    id: "FINANCE",
    label: "Financiera",
    icon: "DollarSign",
    color: "#34C759",
    description: "Gestiona información financiera, costos y facturación",
    type: "dependency" as const,
  },
  {
    id: "OPERATIONS",
    label: "Operaciones",
    icon: "Settings",
    color: "#FF9500",
    description: "Maneja información operativa y logística del servicio",
    type: "dependency" as const,
  },
  {
    id: "LEGAL",
    label: "Jurídica",
    icon: "Shield",
    color: "#AF52DE",
    description: "Verifica aspectos legales, contractuales y de cumplimiento",
    type: "dependency" as const,
  },
  {
    id: "IT",
    label: "Tecnología",
    icon: "Cpu",
    color: "#5AC8FA",
    description: "Proporciona información técnica y de sistemas",
    type: "dependency" as const,
  },
  {
    id: "SUPPLY_CHAIN",
    label: "Cadena de Suministro",
    icon: "Package",
    color: "#FF2D55",
    description: "Gestiona proveedores, inventarios y entregas",
    type: "dependency" as const,
  },
  {
    id: "SERVICE_SUPPORT",
    label: "Soporte de Servicio",
    icon: "Headphones",
    color: "#FF6B35",
    description: "Brinda información de soporte y atención al cliente",
    type: "dependency" as const,
  },
] as const;

export type AreaId = typeof AREAS[number]["id"];

export const AREA_LABEL_MAP: Record<string, string> = Object.fromEntries(
  AREAS.map((a) => [a.id, a.label])
);

export const AREA_COLOR_MAP: Record<string, string> = Object.fromEntries(
  AREAS.map((a) => [a.id, a.color])
);

export const HUB_AREA = "EXECUTIVE_ACCOUNTANT";
export const START_AREA = "DISPATCHER";

export const DEPENDENCIES = AREAS.filter((a) => a.type === "dependency");

export type WorkflowStatus = "IN_PROGRESS" | "COMPLETED";
export type FieldType = "text" | "textarea" | "number" | "date" | "select";
export type NotificationType = "area_change" | "escalation" | "return" | "save" | "complete" | "info";
