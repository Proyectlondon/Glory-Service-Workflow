export const AREAS = [
  { id: "DISPATCHER", label: "Dispatcher", color: "bg-blue-500", description: "Recibe y registra la solicitud inicial" },
  { id: "SERVICE_EXECUTIVE", label: "Service Executive", color: "bg-purple-500", description: "Ejecutivo de servicio evalúa y asigna recursos" },
  { id: "ACCOUNTANT", label: "Accountant", color: "bg-green-500", description: "Contabiliza costos y verifica facturación" },
  { id: "SERVICE_SUPPORT", label: "Service Support", color: "bg-orange-500", description: "Soporte técnico confirma viabilidad operativa" },
  { id: "SUPPLY_CHAIN", label: "Supply Chain", color: "bg-rose-500", description: "Cadena de suministro gestiona logística y entrega" },
] as const;

export type AreaId = typeof AREAS[number]["id"];

export const AREA_LABEL_MAP: Record<string, string> = Object.fromEntries(
  AREAS.map((a) => [a.id, a.label])
);

export const AREA_ORDER: string[] = AREAS.map((a) => a.id);

export type WorkflowStatus = "IN_PROGRESS" | "COMPLETED";

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox";

export type NotificationType = "area_change" | "save" | "complete" | "info";
