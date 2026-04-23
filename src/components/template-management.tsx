"use client";

import { useState, useEffect } from "react";
import { AREA_LABEL_MAP } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TemplateField {
  label: string;
  fieldType: string;
  area: string;
  required: boolean;
  orderIndex: number;
}

interface Template {
  id: string;
  name: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTemplates(data);
      } else {
        setTemplates([]);
      }
    } catch {
      toast.error("Error al cargar plantillas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Plantilla eliminada");
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group fields by area for display
  const groupByArea = (fields: TemplateField[]) => {
    const groups: Record<string, TemplateField[]> = {};
    fields.forEach((f) => {
      if (!groups[f.area]) groups[f.area] = [];
      groups[f.area].push(f);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Gestión de Plantillas
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra las plantillas reutilizables para crear flujos de trabajo
        </p>
      </div>

      {templates.length === 0 ? (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground">
              Sin plantillas
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea plantillas subiendo un formato Word o guardándolas desde un flujo existente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {templates.map((template) => {
              const fields = Array.isArray(template.fields) ? template.fields : [];
              const groups = groupByArea(fields);
              const isExpanded = expandedId === template.id;

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header row */}
                      <div className="flex items-center justify-between p-5">
                        <button
                          onClick={() => toggleExpand(template.id)}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5856D6]/10 flex-shrink-0">
                            <FileText className="h-5 w-5 text-[#5856D6]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-foreground">
                              {template.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {fields.length} campos
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(template.createdAt).toLocaleDateString("es-CO")}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === template.id}
                          className="ml-2 h-8 w-8 rounded-full text-[#FF3B30] hover:bg-[#FF3B30]/10 flex-shrink-0"
                          onClick={() => handleDelete(template.id, template.name)}
                        >
                          {deletingId === template.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF3B30] border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded fields */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-5 space-y-4">
                            {Object.entries(groups).map(([area, areaFields]) => (
                              <div key={area}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className="rounded-full text-[11px] font-medium"
                                    style={{
                                      backgroundColor: `${
                                        area === "DISPATCHER" ? "#007AFF" :
                                        area === "EXECUTIVE_ACCOUNTANT" ? "#5856D6" :
                                        area === "FINANCE" ? "#34C759" :
                                        area === "OPERATIONS" ? "#FF9500" :
                                        area === "SUPPLY_CHAIN" ? "#00C7BE" :
                                        "#8E8E93"
                                      }20`,
                                      color:
                                        area === "DISPATCHER" ? "#007AFF" :
                                        area === "EXECUTIVE_ACCOUNTANT" ? "#5856D6" :
                                        area === "FINANCE" ? "#34C759" :
                                        area === "OPERATIONS" ? "#FF9500" :
                                        area === "SUPPLY_CHAIN" ? "#00C7BE" :
                                        "#8E8E93",
                                    }}
                                  >
                                    {AREA_LABEL_MAP[area] || area}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {areaFields.length} campos
                                  </span>
                                </div>
                                <div className="grid gap-1.5 sm:grid-cols-2">
                                  {areaFields.map((f, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                                    >
                                      <span className="text-foreground truncate">
                                        {f.label}
                                      </span>
                                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                        <span className="text-[10px] text-muted-foreground capitalize">
                                          {f.fieldType}
                                        </span>
                                        {f.required && (
                                          <span className="text-[10px] text-[#FF3B30] font-medium">
                                            *
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
