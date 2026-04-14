"use client";

import { useAppStore, Workflow, WorkflowField } from "@/lib/store";
import { AREAS, AREA_LABEL_MAP, AREA_ORDER } from "@/lib/types";
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
  GripVertical,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function WorkflowDetail() {
  const {
    selectedWorkflowId,
    workflows,
    setCurrentView,
    updateWorkflowInList,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [activeArea, setActiveArea] = useState<string>("DISPATCHER");
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [newFieldDialogOpen, setNewFieldDialogOpen] = useState(false);
  const [newField, setNewField] = useState({
    label: "",
    fieldType: "text" as string,
    area: "DISPATCHER",
    required: false,
  });
  const [editingWorkflowName, setEditingWorkflowName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");

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
    } catch (e) {
      console.error("Error fetching workflow:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWorkflowId, setIsLoading]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const currentAreaIdx = AREA_ORDER.indexOf(activeArea);
  const nextArea = currentAreaIdx < AREA_ORDER.length - 1 ? AREA_ORDER[currentAreaIdx + 1] : null;
  const isLastArea = currentAreaIdx >= AREA_ORDER.length - 1;

  const getWorkflowProgress = () => {
    if (!workflow || workflow.status === "COMPLETED") return 100;
    const idx = AREA_ORDER.indexOf(workflow.currentArea);
    return Math.round(((idx + 1) / AREA_ORDER.length) * 100);
  };

  const getAreaFields = (areaId: string) => {
    if (!workflow) return [];
    return workflow.fields.filter((f) => f.area === areaId);
  };

  const getAreaCompletion = (areaId: string) => {
    const fields = getAreaFields(areaId);
    if (fields.length === 0) return 0;
    const filled = fields.filter((f) => f.value && f.value.trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const updateFieldValue = (fieldId: string, value: string) => {
    if (!workflow) return;
    setWorkflow({
      ...workflow,
      fields: workflow.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)),
    });
  };

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflow.name,
          fields: workflow.fields.map((f, i) => ({
            label: f.label,
            value: f.value,
            fieldType: f.fieldType,
            area: f.area,
            required: f.required,
            orderIndex: i,
          })),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        toast.success("Cambios guardados correctamente", {
          description: "Se ha notificado al equipo sobre esta actualización.",
        });
      }
    } catch (e) {
      console.error("Error saving:", e);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async () => {
    if (!workflow || !nextArea) return;

    const currentAreaFields = getAreaFields(workflow.currentArea);
    const requiredEmpty = currentAreaFields.filter(
      (f) => f.required && (!f.value || f.value.trim() === "")
    );

    if (requiredEmpty.length > 0) {
      toast.error("Campos obligatorios pendientes", {
        description: `Complete los campos requeridos antes de avanzar: ${requiredEmpty.map((f) => f.label).join(", ")}`,
      });
      return;
    }

    setAdvancing(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: workflow.fields.map((f, i) => ({
            label: f.label,
            value: f.value,
            fieldType: f.fieldType,
            area: f.area,
            required: f.required,
            orderIndex: i,
          })),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        setActiveArea(updated.currentArea);
        toast.success("Flujo avanzado correctamente", {
          description: `El formato ha pasado a ${AREA_LABEL_MAP[updated.currentArea]}`,
        });
      }
    } catch (e) {
      console.error("Error advancing:", e);
      toast.error("Error al avanzar el flujo");
    } finally {
      setAdvancing(false);
    }
  };

  const handleComplete = async () => {
    if (!workflow) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: workflow.fields.map((f, i) => ({
            label: f.label,
            value: f.value,
            fieldType: f.fieldType,
            area: f.area,
            required: f.required,
            orderIndex: i,
          })),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
        toast.success("Formato completado exitosamente", {
          description: "Puede descargar el documento diligenciado en formato Word.",
        });
      }
    } catch (e) {
      console.error("Error completing:", e);
      toast.error("Error al completar el flujo");
    } finally {
      setCompleting(false);
    }
  };

  const handleAddField = async () => {
    if (!workflow || !newField.label.trim()) return;
    const updatedFields = [
      ...workflow.fields,
      {
        id: `temp-${Date.now()}`,
        workflowId: workflow.id,
        label: newField.label.trim(),
        value: "",
        fieldType: newField.fieldType,
        area: newField.area,
        required: newField.required,
        orderIndex: workflow.fields.length,
      },
    ];
    setWorkflow({ ...workflow, fields: updatedFields });
    setNewFieldDialogOpen(false);
    setNewField({ label: "", fieldType: "text", area: activeArea, required: false });
    toast.success("Campo agregado");
  };

  const handleDeleteField = (fieldId: string) => {
    if (!workflow) return;
    setWorkflow({
      ...workflow,
      fields: workflow.fields.filter((f) => f.id !== fieldId),
    });
    toast("Campo eliminado");
  };

  const handleNameUpdate = async () => {
    if (!workflow || !workflowName.trim()) return;
    setEditingWorkflowName(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName.trim(),
          fields: workflow.fields.map((f, i) => ({
            label: f.label,
            value: f.value,
            fieldType: f.fieldType,
            area: f.area,
            required: f.required,
            orderIndex: i,
          })),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        updateWorkflowInList(updated);
      }
    } catch (e) {
      console.error("Error updating name:", e);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !workflow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const areaFields = getAreaFields(activeArea);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentView("dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              {editingWorkflowName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="h-7 text-sm font-semibold"
                    onKeyDown={(e) => e.key === "Enter" && handleNameUpdate()}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNameUpdate}>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingWorkflowName(true)}
                  className="flex items-center gap-2 group"
                >
                  <h1 className="truncate text-sm font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                    {workflow.name}
                  </h1>
                  <Settings className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/workflows/${workflow.id}/download`, "_blank")}
                className="border-border/60"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Descargar</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <Card className="mb-6 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progreso General</span>
              <span className="text-sm font-bold text-amber-600">{getWorkflowProgress()}%</span>
            </div>
            <Progress value={getWorkflowProgress()} className="h-2 mb-4" />

            {/* Area Steps */}
            <div className="flex items-center gap-1">
              {AREAS.map((area, idx) => {
                const areaIdx = AREA_ORDER.indexOf(area.id);
                const workflowIdx = AREA_ORDER.indexOf(workflow.currentArea);
                const isCompleted = workflow.status === "COMPLETED" || areaIdx < workflowIdx;
                const isCurrent = area.id === workflow.currentArea;

                return (
                  <button
                    key={area.id}
                    onClick={() => setActiveArea(area.id)}
                    className={`flex-1 rounded-lg p-2 sm:p-3 text-center transition-all ${
                      isCurrent
                        ? "bg-amber-500/10 border border-amber-500/30 ring-1 ring-amber-500/20"
                        : isCompleted
                        ? "bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/15"
                        : "bg-muted/50 border border-border/40 cursor-pointer hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : isCurrent ? (
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-[10px] sm:text-xs font-medium text-foreground hidden sm:inline">
                        {area.label}
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground sm:hidden">
                        {area.label.split(" ")[0]}
                      </span>
                    </div>
                    <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                      {getAreaCompletion(area.id)}% completado
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Fields Editor */}
          <div className="lg:col-span-2">
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg ${AREAS.find((a) => a.id === activeArea)?.color} p-1.5`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {AREA_LABEL_MAP[activeArea]}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {AREAS.find((a) => a.id === activeArea)?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {areaFields.length} campos
                    </Badge>
                    {workflow.status === "IN_PROGRESS" && activeArea === workflow.currentArea && (
                      <Dialog open={newFieldDialogOpen} onOpenChange={setNewFieldDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Agregar Campo</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 pt-2">
                            <div>
                              <Label className="text-xs">Nombre del Campo</Label>
                              <Input
                                placeholder="Ej: Número de Referencia"
                                value={newField.label}
                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Tipo de Campo</Label>
                              <Select
                                value={newField.fieldType}
                                onValueChange={(v) => setNewField({ ...newField, fieldType: v })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texto</SelectItem>
                                  <SelectItem value="textarea">Texto Largo</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="date">Fecha</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Área</Label>
                              <Select
                                value={newField.area}
                                onValueChange={(v) => setNewField({ ...newField, area: v })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AREAS.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newField.required}
                                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                className="rounded border-border"
                              />
                              <span className="text-xs text-foreground">Campo obligatorio</span>
                            </label>
                            <Button
                              onClick={handleAddField}
                              disabled={!newField.label.trim()}
                              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {workflow.status === "COMPLETED" && (
                  <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-700 font-medium">
                      Formato completado. Puede descargar el documento Word diligenciado.
                    </p>
                  </div>
                )}

                {workflow.status === "IN_PROGRESS" && activeArea !== workflow.currentArea && (
                  <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-amber-700">
                      Este área ya fue procesada. Puede consultar los campos pero la edición corresponde a{" "}
                      <strong>{AREA_LABEL_MAP[workflow.currentArea]}</strong>.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <AnimatePresence>
                    {areaFields.map((field) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="group rounded-lg border border-border/40 bg-card p-3 transition-all hover:border-border"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-sm font-medium text-foreground">
                              {field.label}
                            </Label>
                            {field.required && (
                              <span className="text-red-500 text-xs">*</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {field.fieldType}
                            </Badge>
                            {workflow.status === "IN_PROGRESS" && activeArea === workflow.currentArea && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {field.fieldType === "textarea" ? (
                          <Textarea
                            value={field.value}
                            onChange={(e) => updateFieldValue(field.id, e.target.value)}
                            disabled={workflow.status === "COMPLETED" || activeArea !== workflow.currentArea}
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                            className="min-h-[80px] resize-none"
                          />
                        ) : field.fieldType === "number" ? (
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => updateFieldValue(field.id, e.target.value)}
                            disabled={workflow.status === "COMPLETED" || activeArea !== workflow.currentArea}
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                          />
                        ) : field.fieldType === "date" ? (
                          <Input
                            type="date"
                            value={field.value}
                            onChange={(e) => updateFieldValue(field.id, e.target.value)}
                            disabled={workflow.status === "COMPLETED" || activeArea !== workflow.currentArea}
                          />
                        ) : (
                          <Input
                            value={field.value}
                            onChange={(e) => updateFieldValue(field.id, e.target.value)}
                            disabled={workflow.status === "COMPLETED" || activeArea !== workflow.currentArea}
                            placeholder={`Ingrese ${field.label.toLowerCase()}...`}
                          />
                        )}
                        {field.value && (
                          <p className="mt-1 text-[10px] text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Diligenciado
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {areaFields.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No hay campos para esta área
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Agregue campos haciendo clic en el botón +
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <Card className="border-border/40">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Acciones</h3>
                {workflow.status === "IN_PROGRESS" && (
                  <>
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                      onClick={handleAdvance}
                      disabled={advancing || !nextArea}
                    >
                      {advancing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Avanzar a {nextArea ? AREA_LABEL_MAP[nextArea] : ""}
                        </>
                      )}
                    </Button>
                    {isLastArea && (
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        onClick={handleComplete}
                        disabled={completing}
                      >
                        {completing ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Completar Formato
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="outline"
                  className="w-full border-border/60"
                  onClick={() => window.open(`/api/workflows/${workflow.id}/download`, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Word
                </Button>
              </CardContent>
            </Card>

            {/* All Areas Summary */}
            <Card className="border-border/40">
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen por Área</h3>
                <div className="space-y-2">
                  {AREAS.map((area) => {
                    const fields = getAreaFields(area.id);
                    const completion = getAreaCompletion(area.id);
                    const areaIdx = AREA_ORDER.indexOf(area.id);
                    const workflowIdx = AREA_ORDER.indexOf(workflow.currentArea);
                    const isActive = area.id === workflow.currentArea;
                    const isDone = workflow.status === "COMPLETED" || areaIdx < workflowIdx;

                    return (
                      <button
                        key={area.id}
                        onClick={() => setActiveArea(area.id)}
                        className={`w-full rounded-lg border p-2.5 text-left transition-all ${
                          isActive
                            ? "border-amber-500/30 bg-amber-500/5"
                            : isDone
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-border/40 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : isActive ? (
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                            )}
                            <span className="text-xs font-medium text-foreground">{area.label}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {fields.filter((f) => f.value && f.value.trim() !== "").length}/{fields.length}
                          </span>
                        </div>
                        <Progress value={completion} className="h-1" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="border-border/40">
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Información</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Documento original</span>
                    <span className="truncate max-w-[150px] font-medium text-foreground">{workflow.documentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        workflow.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {workflow.status === "COMPLETED" ? "Completado" : "En Progreso"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Campos totales</span>
                    <span className="font-medium text-foreground">{workflow.fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creado</span>
                    <span className="font-medium text-foreground">
                      {new Date(workflow.createdAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actualizado</span>
                    <span className="font-medium text-foreground">
                      {new Date(workflow.updatedAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
