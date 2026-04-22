"use client";

import { useAppStore, Workflow } from "@/lib/store";
import { AREAS, AREA_LABEL_MAP, AREA_COLOR_MAP, HUB_AREA, DEPENDENCIES } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  ArrowRight,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
  FileText,
  Users,
  Clock,
  Settings,
  Mail,
  UserCheck,
  DollarSign,
  Shield,
  Cpu,
  Package,
  Headphones,
  AlertTriangle,
  Send,
  RotateCcw,
  ChevronDown,
  ImagePlus,
  FileUp,
  X,
  Eye,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { AIAssistant } from "./ai-assistant";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, UserCheck, DollarSign, Settings, Shield, Cpu, Package, Headphones,
};

/* ─── Evidence Upload Component ─── */
function EvidenceUpload({ value, disabled, onChange }: { value: string; disabled: boolean; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  let evidence: { url: string; name: string; isImage: boolean } | null = null;
  try {
    if (value) evidence = JSON.parse(value);
  } catch { /* */ }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-evidence", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al subir");
        setUploading(false);
        return;
      }
      const data = await res.json();
      onChange(JSON.stringify({ url: data.url, name: data.originalName, isImage: data.isImage }));
      toast.success("Evidencia adjuntada");
    } catch {
      toast.error("Error al subir evidencia");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    toast("Evidencia eliminada");
  };

  const formatSize = (url: string) => {
    if (!url) return "";
    const ext = url.split(".").pop()?.toLowerCase();
    return ext ? ext.toUpperCase() : "";
  };

  if (evidence) {
    return (
      <div className="flex items-center gap-3">
        {evidence.isImage ? (
          <button
            onClick={() => setPreviewOpen(true)}
            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted transition-all hover:shadow-md"
          >
            <img src={evidence.url} alt={evidence.name} className="h-full w-full object-cover" suppressHydrationWarning />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
              <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
            </div>
          </button>
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
            <Paperclip className="h-6 w-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{evidence.name}</p>
          <Badge className="mt-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
            {formatSize(evidence.url)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {!disabled && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-[#FF3B30] hover:bg-[#FF3B30]/8" onClick={handleRemove}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Image Preview Dialog */}
        {previewOpen && evidence.isImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[85vh] max-w-[85vw] rounded-2xl bg-card p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={evidence.url} alt={evidence.name} className="max-h-[80vh] max-w-[80vw] rounded-xl object-contain" suppressHydrationWarning />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-card shadow-md hover:bg-muted"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/50 px-3 py-1.5">
                <p className="truncate text-xs text-white">{evidence.name}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleUpload} className="hidden" disabled={disabled} />
      <button
        onClick={() => !disabled && fileRef.current?.click()}
        disabled={disabled || uploading}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-sm transition-all ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/4"
        }`}
      >
        {uploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Subir foto o documento</span>
          </>
        )}
      </button>
      <p className="mt-1 text-center text-[10px] text-muted-foreground/60">JPG, PNG, GIF, WebP, PDF, Word, Excel &middot; Máx. 10MB</p>
    </div>
  );
}

// Helper to get auth headers from Zustand store
function getAuthHeaders(): Record<string, string> {
  const token = useAppStore.getState().token;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

const isCurrencyField = (label: string) => {
  if (!label) return false;
  const currencyKeywords = [
    "costo", "precio", "valor", "total", "iva", "subtotal", "monto", 
    "pago", "presupuesto", "tarifa", "cuota", "honorarios"
  ];
  // Normalizar para quitar tildes y caracteres especiales
  const normalizedLabel = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return currencyKeywords.some((keyword) => normalizedLabel.includes(keyword));
};

const formatCurrencyUI = (val: string) => {
  if (!val || val === "(Sin diligenciar)") return "";
  
  // Extraer solo números y punto decimal
  const cleanValue = val.toString().replace(/[^\d.,]/g, "").replace(",", ".");
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) return val;
  
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // Generalmente COP no usa decimales, pero el formateador los manejará si se requiere
  })
    .format(numericValue)
    .replace("COP", "$")
    .trim();
};

export function WorkflowDetail() {
  const { selectedWorkflowId, setCurrentView, updateWorkflowInList, isLoading, setIsLoading, user } = useAppStore();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [activeArea, setActiveArea] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [newFieldDialogOpen, setNewFieldDialogOpen] = useState(false);
  const [newField, setNewField] = useState({ label: "", fieldType: "text" as string, area: "EXECUTIVE_ACCOUNTANT", required: false });
  const [editingName, setEditingName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [escalateMenuOpen, setEscalateMenuOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchWorkflow = useCallback(async () => {
    if (!selectedWorkflowId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workflows/${selectedWorkflowId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
        setActiveArea(data.currentArea);
        setWorkflowName(data.name);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [selectedWorkflowId, setIsLoading]);

  useEffect(() => { fetchWorkflow(); }, [fetchWorkflow]);

  const getCompletedAreas = (): string[] => {
    if (!workflow) return [];
    try { return JSON.parse(workflow.completedAreas || "[]"); } catch { return []; }
  };

  const getAreaFields = (areaId: string) => workflow?.fields.filter((f) => f.area === areaId) || [];

  const getAreaCompletion = (areaId: string) => {
    const fields = getAreaFields(areaId);
    if (fields.length === 0) return 0;
    return Math.round((fields.filter((f) => f.value?.trim()).length / fields.length) * 100);
  };

  const isCurrent = (areaId: string) => workflow?.currentArea === areaId;
  const isHub = activeArea === HUB_AREA;
  const isDispatcher = activeArea === "DISPATCHER";

  // Area-based edit permissions: admin can always edit, regular users only when area matches
  const canEdit = workflow
    ? workflow.status === "IN_PROGRESS" &&
      (user?.role === "admin" || activeArea === workflow.currentArea)
    : false;

  const updateFieldValue = (fieldId: string, value: string) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, fields: workflow.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)) });
  };

  const handleAIFill = (fieldLabel: string, value: string) => {
    if (!workflow) return;
    const field = workflow.fields.find(f => f.label.toLowerCase().includes(fieldLabel.toLowerCase()));
    if (field) {
      updateFieldValue(field.id, value);
      toast.success(`IA: Campo "${field.label}" actualizado`);
    } else {
      toast.error(`IA: No encontré el campo "${fieldLabel}"`);
    }
  };

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: workflow.name, fields: workflow.fields.map((f, i) => ({ label: f.label, value: f.value, fieldType: f.fieldType, area: f.area, required: f.required, orderIndex: i })) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        toast.success("Cambios guardados");
      } else {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        toast.error(err.error || "Error al guardar");
      }
    } catch { toast.error("Error de conexión al guardar"); }
    finally { setSaving(false); }
  };

  const handleAdvance = async (targetArea: string) => {
    if (!workflow) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/advance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetArea, fields: workflow.fields.map((f, i) => ({ label: f.label, value: f.value, fieldType: f.fieldType, area: f.area, required: f.required, orderIndex: i })) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        setActiveArea(updated.currentArea);
        const action = workflow.currentArea === "DISPATCHER" ? "enviado" : "escalado";
        toast.success(`Formato ${action} a ${AREA_LABEL_MAP[targetArea]}`);
      } else {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        toast.error(err.error || "Error al avanzar el formato");
      }
    } catch { toast.error("Error de conexión al avanzar"); }
    finally { setAdvancing(false); }
  };

  const handleComplete = async () => {
    if (!workflow) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ fields: workflow.fields.map((f, i) => ({ label: f.label, value: f.value, fieldType: f.fieldType, area: f.area, required: f.required, orderIndex: i })) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        toast.success("Formato completado exitosamente");
      } else {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        toast.error(err.error || "Error al completar");
      }
    } catch { toast.error("Error de conexión al completar"); }
    finally { setCompleting(false); }
  };

  const handleAddField = async () => {
    if (!workflow || !newField.label.trim()) return;
    setWorkflow({
      ...workflow,
      fields: [...workflow.fields, { id: `temp-${Date.now()}`, workflowId: workflow.id, label: newField.label.trim(), value: "", fieldType: newField.fieldType, area: newField.area, required: newField.required, orderIndex: workflow.fields.length }],
    });
    setNewFieldDialogOpen(false);
    setNewField({ label: "", fieldType: "text", area: activeArea, required: false });
    toast.success("Campo agregado");
  };

  const handleDeleteField = (fieldId: string) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, fields: workflow.fields.filter((f) => f.id !== fieldId) });
    toast("Campo eliminado");
  };

  const handleNameUpdate = async () => {
    if (!workflow || !workflowName.trim()) return;
    setEditingName(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: workflowName.trim(), fields: workflow.fields.map((f, i) => ({ label: f.label, value: f.value, fieldType: f.fieldType, area: f.area, required: f.required, orderIndex: i })) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
      }
    } catch { /* */ }
    finally { setSaving(false); }
  };

  const handleSaveAsTemplate = async () => {
    if (!workflow) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: `Plantilla de ${workflow.name}`, fields: workflow.fields })
      });
      if (res.ok) {
        toast.success("Plantilla guardada con éxito");
      } else {
        toast.error("Error al guardar plantilla");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingTemplate(false);
    }
  };

  if (isLoading || !workflow) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  const areaFields = getAreaFields(activeArea);
  const currentAreaInfo = AREAS.find((a) => a.id === workflow.currentArea);
  const completedAreas = getCompletedAreas();

  // Check if user can advance from the current area
  const canAdvance = canEdit && (
    workflow.currentArea === "DISPATCHER" ||
    workflow.currentArea === HUB_AREA ||
    DEPENDENCIES.some((d) => d.id === workflow.currentArea)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => setCurrentView("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="h-7 w-48 text-sm rounded-lg" onKeyDown={(e) => e.key === "Enter" && handleNameUpdate()} autoFocus />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNameUpdate}><CheckCircle2 className="h-4 w-4 text-[#34C759]" /></Button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)} className="group truncate text-sm font-semibold text-foreground hover:text-primary transition-colors text-left">
                {workflow.name}
                <Settings className="inline h-3 w-3 ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/workflows/${workflow.id}/download`, "_blank")} className="rounded-full border-border bg-background text-foreground hover:bg-accent">
              <Download className="mr-1 h-3.5 w-3.5" /><span className="hidden sm:inline">Descargar</span>
            </Button>
            {canEdit && (
              <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full bg-[#007AFF] text-white hover:bg-[#0066E0] shadow-sm shadow-[#007AFF]/20">
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Save className="mr-1 h-3.5 w-3.5" />Guardar</>}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Status + Hub Navigation */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {(() => { const Icon = ICON_MAP[currentAreaInfo?.icon || "Settings"] || Settings; return <Icon className="h-5 w-5" style={{ color: currentAreaInfo?.color }} />; })()}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {AREA_LABEL_MAP[workflow.currentArea]}
                  {workflow.status === "COMPLETED" && (
                    <Badge className="ml-2 rounded-full bg-green-500/10 text-green-500 text-[11px]">Completado</Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{currentAreaInfo?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canAdvance && workflow.currentArea === "DISPATCHER" && workflow.status === "IN_PROGRESS" && (
                <Button size="sm" onClick={() => handleAdvance("EXECUTIVE_ACCOUNTANT")} disabled={advancing} className="rounded-full bg-[#007AFF] text-white hover:bg-[#0066E0] shadow-sm shadow-[#007AFF]/20">
                  {advancing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Send className="mr-1 h-3.5 w-3.5" />Enviar a Ejecutiva</>}
                </Button>
              )}
              {canAdvance && workflow.currentArea === HUB_AREA && workflow.status === "IN_PROGRESS" && (
                <DropdownMenu open={escalateMenuOpen} onOpenChange={setEscalateMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" disabled={advancing} className="rounded-full bg-[#007AFF] text-white hover:bg-[#0066E0] shadow-sm shadow-[#007AFF]/20">
                      {advancing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Send className="mr-1 h-3.5 w-3.5" />Escalar a<ChevronDown className="ml-1 h-3.5 w-3.5" /></>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-56">
                    {DEPENDENCIES.map((dep) => {
                      const DepIcon = ICON_MAP[dep.icon] || Settings;
                      const done = completedAreas.includes(dep.id);
                      return (
                        <DropdownMenuItem key={dep.id} onClick={() => { setEscalateMenuOpen(false); handleAdvance(dep.id); }} className="py-2.5 cursor-pointer">
                          <DepIcon className="mr-2.5 h-4 w-4" style={{ color: dep.color }} />
                          <span className="flex-1">{dep.label}</span>
                          {done && <Badge className="rounded-full bg-[#34C759]/10 text-[#34C759] text-[10px]">Hecho</Badge>}
                        </DropdownMenuItem>
                      );
                    })}
                    <div className="my-1 border-t border-border" />
                    <DropdownMenuItem onClick={() => { setEscalateMenuOpen(false); handleComplete(); }} className="py-2.5 cursor-pointer text-[#34C759]">
                      <CheckCircle2 className="mr-2.5 h-4 w-4" />
                      <span className="flex-1">Completar Formato</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {canAdvance && DEPENDENCIES.some((d) => d.id === workflow.currentArea) && workflow.status === "IN_PROGRESS" && (
                <Button size="sm" onClick={() => handleAdvance("EXECUTIVE_ACCOUNTANT")} disabled={advancing} className="rounded-full bg-[#FF9500] text-white hover:bg-[#E68600] shadow-sm shadow-[#FF9500]/20">
                  {advancing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><RotateCcw className="mr-1 h-3.5 w-3.5" />Devolver a Ejecutiva</>}
                </Button>
              )}
            </div>
          </div>

          {/* Area selector tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {AREAS.map((area) => {
              const Icon = ICON_MAP[area.icon] || Settings;
              const active = activeArea === area.id;
              const done = completedAreas.includes(area.id);
              const current = isCurrent(area.id);
              return (
                <button
                  key={area.id}
                  onClick={() => setActiveArea(area.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active ? "bg-primary text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {area.label}
                  {done && <CheckCircle2 className="h-3 w-3 text-[#34C759]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Field Editor */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {(() => { 
                      const area = AREAS.find((a) => a.id === activeArea);
                      const Icon = ICON_MAP[area?.icon || "Settings"] || Settings; 
                      return <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${area?.color || "#E5E5EA"}12` }}><Icon className="h-4 w-4" style={{ color: area?.color || "#6B7280" }} /></div>; 
                    })()}
                    <div>
                      <CardTitle className="text-sm text-foreground">{AREA_LABEL_MAP[activeArea]}</CardTitle>
                      <p className="text-[11px] text-muted-foreground">{areaFields.length} campos</p>
                    </div>
                  </div>
                  {canEdit && (
                    <Dialog open={newFieldDialogOpen} onOpenChange={setNewFieldDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-[#007AFF]/5 h-8 w-8"><Plus className="h-4 w-4 text-[#007AFF]" /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm rounded-2xl border-border">
                        <DialogHeader><DialogTitle className="text-foreground">Agregar Campo</DialogTitle></DialogHeader>
                        <div className="space-y-3 pt-2">
                          <div><Label className="text-xs text-foreground">Nombre</Label><Input placeholder="Ej: Número de Referencia" value={newField.label} onChange={(e) => setNewField({ ...newField, label: e.target.value })} className="mt-1 rounded-xl" /></div>
                          <div><Label className="text-xs text-foreground">Tipo</Label><Select value={newField.fieldType} onValueChange={(v) => setNewField({ ...newField, fieldType: v })}><SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="text">Texto</SelectItem><SelectItem value="textarea">Texto largo</SelectItem><SelectItem value="number">Número</SelectItem><SelectItem value="date">Fecha</SelectItem><SelectItem value="evidence">Evidencia (foto/documento)</SelectItem></SelectContent></Select></div>
                          <div><Label className="text-xs text-foreground">Área</Label><Select value={newField.area} onValueChange={(v) => setNewField({ ...newField, area: v })}><SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{AREAS.map((a) => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newField.required} onChange={(e) => setNewField({ ...newField, required: e.target.checked })} className="rounded" /><span className="text-xs text-foreground">Obligatorio</span></label>
                          <Button onClick={handleAddField} disabled={!newField.label.trim()} className="w-full h-10 rounded-xl bg-[#007AFF] text-white hover:bg-[#0066E0]"><Plus className="mr-1.5 h-4 w-4" />Agregar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {workflow.status === "COMPLETED" && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#34C759]/8 p-3">
                    <CheckCircle2 className="h-4 w-4 text-[#34C759]" />
                    <p className="text-sm text-[#34C759] font-medium">Formato completado. Puede descargar el documento.</p>
                  </div>
                )}
                {!canEdit && workflow.status === "IN_PROGRESS" && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FF9500]/8 p-3">
                    <AlertTriangle className="h-4 w-4 text-[#FF9500]" />
                    <p className="text-sm text-[#FF9500]">
                      {user?.role === "admin"
                        ? "Este formato está en progreso."
                        : <>Solo <strong>{AREA_LABEL_MAP[workflow.currentArea]}</strong> puede editar en este momento.</>
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <AnimatePresence>
                    {areaFields.map((field) => (
                      <motion.div key={field.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="group rounded-xl border border-border bg-muted p-4 transition-all hover:bg-card hover:shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                            {field.required && <span className="text-[#FF3B30] text-xs">*</span>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit && <Button variant="ghost" size="icon" className="h-6 w-6 text-[#FF3B30] hover:bg-[#FF3B30]/8" onClick={() => handleDeleteField(field.id)}><Trash2 className="h-3 w-3" /></Button>}
                          </div>
                        </div>
                        {field.fieldType === "textarea" ? (
                          <Textarea value={field.value} onChange={(e) => updateFieldValue(field.id, e.target.value)} disabled={!canEdit} placeholder={`Ingrese ${field.label.toLowerCase()}...`} className="min-h-[72px] resize-none rounded-xl border-border bg-background" />
                        ) : field.fieldType === "number" || (field.fieldType === "text" && isCurrencyField(field.label)) ? (
                          <div className="relative">
                            <Input
                              type={isCurrencyField(field.label) ? "text" : "number"}
                              value={isCurrencyField(field.label) ? formatCurrencyUI(field.value) : field.value}
                              onChange={(e) => {
                                const rawValue = isCurrencyField(field.label) 
                                  ? e.target.value.replace(/[^\d]/g, "")
                                  : e.target.value;
                                updateFieldValue(field.id, rawValue);
                              }}
                              disabled={!canEdit}
                              placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                              className={`h-9 rounded-xl border-border bg-background ${isCurrencyField(field.label) ? "pl-8" : ""}`}
                            />
                            {isCurrencyField(field.label) && (
                              <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                            )}
                          </div>
                        ) : field.fieldType === "date" ? (
                          <Input type="date" value={field.value} onChange={(e) => updateFieldValue(field.id, e.target.value)} disabled={!canEdit} className="h-9 rounded-xl border-border bg-background" />
                        ) : field.fieldType === "evidence" ? (
                          <EvidenceUpload
                            value={field.value}
                            disabled={!canEdit}
                            onChange={(v) => updateFieldValue(field.id, v)}
                          />
                        ) : (
                          <Input value={field.value} onChange={(e) => updateFieldValue(field.id, e.target.value)} disabled={!canEdit} placeholder={`Ingrese ${field.label.toLowerCase()}...`} className="h-9 rounded-xl border-border bg-background" />
                        )}
                        {field.fieldType !== "evidence" && field.value?.trim() && <p className="mt-1.5 text-[10px] text-[#34C759] flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />Diligenciado</p>}
                        {field.fieldType === "evidence" && field.value && <p className="mt-1.5 text-[10px] text-[#34C759] flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />Evidencia adjunta</p>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {areaFields.length === 0 && (
                    <div className="flex flex-col items-center py-12 text-center">
                      <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">Sin campos en esta área</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Area & User Info */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado Actual</h3>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentAreaInfo?.color }} />
                  <span className="text-sm font-medium text-foreground">
                    Área: {AREA_LABEL_MAP[workflow.currentArea]}
                  </span>
                </div>
                {user && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>Usuario: {user.name} ({AREA_LABEL_MAP[user.area]})</span>
                  </div>
                )}
                {user?.role === "admin" && (
                  <Badge className="rounded-full bg-[#5856D6]/10 text-[#5856D6] text-[10px]">
                    Modo administrador - edición global
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</h3>
                <Button variant="outline" className="w-full rounded-xl border-border bg-card justify-start text-foreground hover:bg-accent" onClick={() => window.open(`/api/workflows/${workflow.id}/download`, "_blank")}>
                  <Download className="mr-2 h-4 w-4" />Descargar Word
                </Button>
                {canEdit && (
                  <Button variant="outline" disabled={savingTemplate} className="w-full rounded-xl border-border bg-card justify-start text-foreground hover:bg-accent" onClick={handleSaveAsTemplate}>
                    {savingTemplate ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar como Plantilla
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Dependencies Status */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado de Dependencias</h3>
                <div className="space-y-1.5">
                  {DEPENDENCIES.map((dep) => {
                    const depFields = getAreaFields(dep.id);
                    const completion = getAreaCompletion(dep.id);
                    const done = completedAreas.includes(dep.id);
                    const DepIcon = ICON_MAP[dep.icon] || Settings;
                    return (
                      <button key={dep.id} onClick={() => setActiveArea(dep.id)} className="w-full rounded-xl p-2.5 text-left transition-all hover:bg-accent">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <DepIcon className="h-3.5 w-3.5" style={{ color: dep.color }} />
                            <span className="text-xs font-medium text-foreground">{dep.label}</span>
                          </div>
                          {done && <CheckCircle2 className="h-3.5 w-3.5 text-[#34C759]" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={completion} className="h-1 flex-1" />
                          <span className="text-[10px] text-muted-foreground w-8 text-right">{completion}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {workflow.areaLogs && workflow.areaLogs.length > 0 && (
              <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {workflow.areaLogs.map((log) => {
                      const actionLabel = log.action === "FORWARDED" ? "Envio" : log.action === "ESCALATED" ? "Escalo" : log.action === "RETURNED" ? "Devuelve" : log.action;
                      const actionColor = log.action === "ESCALATED" ? "#FF9500" : log.action === "RETURNED" ? "#007AFF" : "#34C759";
                      return (
                        <div key={log.id} className="flex items-start gap-2">
                          <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: actionColor }} />
                          <div>
                            <p className="text-xs text-foreground"><strong>{AREA_LABEL_MAP[log.fromArea]}</strong> {actionLabel.toLowerCase()} a <strong>{AREA_LABEL_MAP[log.toArea]}</strong></p>
                            <p className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString("es-CO")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Info</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Documento</span><span className="text-foreground truncate max-w-[150px]">{workflow.documentName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Campos</span><span className="text-foreground">{workflow.fields.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Creado</span><span className="text-foreground">{new Date(workflow.createdAt).toLocaleDateString("es-CO")}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIAssistant 
        workflow={workflow} 
        onApplyField={handleAIFill} 
        activeArea={activeArea}
      />
    </div>
  );
}
