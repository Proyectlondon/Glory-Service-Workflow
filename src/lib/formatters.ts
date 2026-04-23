/**
 * Shared formatting utilities for Glory Service Workflow
 */

/**
 * Normalizes a label to remove accents and special characters for easier keyword matching
 */
export const normalizeLabel = (label: string): string => {
  if (!label) return "";
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Keywords used to identify currency fields
 */
export const CURRENCY_KEYWORDS = [
  "costo", "precio", "valor", "total", "iva", "subtotal", "monto", 
  "pago", "presupuesto", "tarifa", "cuota", "honorarios", "unitario"
];

/**
 * Checks if a field label suggests it contains a currency value
 */
export const isCurrencyLabel = (label: string): boolean => {
  const normalized = normalizeLabel(label);
  return CURRENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

/**
 * Formats a numeric string as COP currency
 */
export const formatCOP = (value: string | number): string => {
  if (value === undefined || value === null || value === "") return "$ 0";
  
  // Convert to numeric value
  const cleanValue = value.toString().replace(/[^\d.,-]/g, "").replace(",", ".");
  const numericValue = parseFloat(cleanValue);

  if (isNaN(numericValue)) return value.toString();

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

/**
 * Heuristically formats a value based on its label
 */
export const formatFieldValue = (value: string, label: string): string => {
  if (!value || value.trim() === "" || value === "(Sin diligenciar)") {
    return "(Sin diligenciar)";
  }

  if (isCurrencyLabel(label)) {
    return formatCOP(value);
  }

  return value;
};
