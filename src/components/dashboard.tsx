"use client";

import { useAppStore, Workflow } from "@/lib/store";
import { AREA_LABEL_MAP, AREAS, AREA_ORDER } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Bell,
  LayoutDashboard,
  Upload,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useState, useEffect, useCallback } from "react";
import { UploadZone } from "./upload-zone";

export function Dashboard() {
  const {
    workflows,
    setWorkflows,
    notifications,
    setNotifications,
    setCurrentView,
    setSelectedWorkflowId,
    isLoading,
    setIsLoading,
    updateWorkflowInList,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "IN_PROGRESS" | "COMPLETED">("all");

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (e) {
      console.error("Error fetching workflows:", e);
    } finally {
      setIsLoading(false);
    }
  }, [setWorkflows, setIsLoading]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  }, [setNotifications]);

  useEffect(() => {
    fetchWorkflows();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchWorkflows, fetchNotifications]);

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (e) {
      console.error("Error deleting workflow:", e);
    }
  };

  const openWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setCurrentView("workflow-detail");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.currentArea.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getWorkflowProgress = (workflow: Workflow) => {
    const currentIdx = AREA_ORDER.indexOf(workflow.currentArea);
    if (workflow.status === "COMPLETED") return 100;
    return Math.round(((currentIdx + 1) / AREA_ORDER.length) * 100);
  };

  const getCurrentAreaBadgeColor = (areaId: string) => {
    const area = AREAS.find((a) => a.id === areaId);
    return area?.color || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/glory-logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground">
                Glory Service <span className="text-amber-500">Workflow</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("notifications")}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
              GS
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Flujos Activos",
              value: workflows.filter((w) => w.status === "IN_PROGRESS").length,
              icon: Clock,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Completados",
              value: workflows.filter((w) => w.status === "COMPLETED").length,
              icon: CheckCircle2,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "Total Flujos",
              value: workflows.length,
              icon: LayoutDashboard,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              label: "Notificaciones",
              value: unreadCount,
              icon: Bell,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/40">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar flujos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex rounded-lg border border-border/60 bg-card p-0.5">
              {(["all", "IN_PROGRESS", "COMPLETED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterStatus === f
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "IN_PROGRESS" ? "En Progreso" : "Completados"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border/60"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Crear Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Flujo Manualmente</DialogTitle>
                </DialogHeader>
                <ManualCreateForm
                  onCreate={async (name, fields) => {
                    const res = await fetch("/api/workflows", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, documentName: `${name}.docx`, documentData: "", fields }),
                    });
                    if (res.ok) {
                      const w = await res.json();
                      updateWorkflowInList(w);
                      openWorkflow(w.id);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
            <UploadZone />
          </div>
        </div>

        {/* Workflow List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold text-foreground">No hay flujos de trabajo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea tu primer flujo subiendo un formato Word o creándolo manualmente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className="group cursor-pointer border-border/40 transition-all hover:border-amber-500/30 hover:shadow-lg"
                    onClick={() => openWorkflow(workflow.id)}
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="truncate font-semibold text-foreground">{workflow.name}</h4>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {workflow.documentName}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openWorkflow(workflow.id);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/api/workflows/${workflow.id}/download`, "_blank");
                              }}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Descargar Word
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkflow(workflow.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {AREA_LABEL_MAP[workflow.currentArea] || workflow.currentArea}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getWorkflowProgress(workflow)}%
                          </span>
                        </div>
                        <Progress value={getWorkflowProgress(workflow)} className="h-1.5" />
                      </div>

                      {/* Area Progress Indicators */}
                      <div className="flex items-center gap-1">
                        {AREAS.map((area, idx) => {
                          const areaIdx = AREA_ORDER.indexOf(area.id);
                          const currentIdx = AREA_ORDER.indexOf(workflow.currentArea);
                          const isCompleted = workflow.status === "COMPLETED" || areaIdx < currentIdx;
                          const isCurrent = area.id === workflow.currentArea;
                          const hasFields = workflow.fields?.some((f) => f.area === area.id);

                          return (
                            <div
                              key={area.id}
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                isCompleted
                                  ? "bg-green-500"
                                  : isCurrent
                                  ? "bg-amber-500"
                                  : hasFields
                                  ? "bg-muted-foreground/20"
                                  : "bg-border"
                              }`}
                              title={`${area.label} - ${isCompleted ? "Completado" : isCurrent ? "En curso" : "Pendiente"}`}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {workflow.fields?.length || 0} campos
                        </p>
                        <div className="flex items-center gap-1">
                          {workflow.status === "COMPLETED" ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Completado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              En Progreso
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function ManualCreateForm({
  onCreate,
}: {
  onCreate: (name: string, fields: any[]) => void;
}) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const defaultFields = [
    { label: "Nombre del Solicitante", value: "", fieldType: "text", area: "DISPATCHER", required: true },
    { label: "Fecha de Solicitud", value: new Date().toISOString().split("T")[0], fieldType: "date", area: "DISPATCHER", required: true },
    { label: "Descripción del Servicio", value: "", fieldType: "textarea", area: "DISPATCHER", required: true },
    { label: "Prioridad", value: "", fieldType: "text", area: "DISPATCHER", required: false },
    { label: "Ejecutivo Asignado", value: "", fieldType: "text", area: "SERVICE_EXECUTIVE", required: true },
    { label: "Recursos Requeridos", value: "", fieldType: "textarea", area: "SERVICE_EXECUTIVE", required: false },
    { label: "Costo Estimado", value: "", fieldType: "number", area: "ACCOUNTANT", required: true },
    { label: "Centro de Costo", value: "", fieldType: "text", area: "ACCOUNTANT", required: false },
    { label: "Viabilidad Técnica", value: "", fieldType: "textarea", area: "SERVICE_SUPPORT", required: true },
    { label: "Fecha de Entrega", value: "", fieldType: "date", area: "SERVICE_SUPPORT", required: false },
    { label: "Proveedor Asignado", value: "", fieldType: "text", area: "SUPPLY_CHAIN", required: false },
    { label: "Número de Orden", value: "", fieldType: "text", area: "SUPPLY_CHAIN", required: true },
    { label: "Observaciones Finales", value: "", fieldType: "textarea", area: "SUPPLY_CHAIN", required: false },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await onCreate(name.trim(), defaultFields);
    setCreating(false);
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium text-foreground">Nombre del Flujo</label>
        <Input
          placeholder="Ej: Solicitud de Servicio #001"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          Se crearán <span className="font-medium text-foreground">13 campos predefinidos</span> distribuidos en las 5 áreas del flujo de servicio. Podrá editar, agregar o eliminar campos después de la creación.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-blue-500/10 p-2 text-center">
          <p className="text-xs font-medium text-blue-600">Dispatcher</p>
          <p className="text-[10px] text-muted-foreground">4 campos</p>
        </div>
        <div className="rounded-md bg-purple-500/10 p-2 text-center">
          <p className="text-xs font-medium text-purple-600">Service Executive</p>
          <p className="text-[10px] text-muted-foreground">2 campos</p>
        </div>
        <div className="rounded-md bg-green-500/10 p-2 text-center">
          <p className="text-xs font-medium text-green-600">Accountant</p>
          <p className="text-[10px] text-muted-foreground">2 campos</p>
        </div>
        <div className="rounded-md bg-orange-500/10 p-2 text-center">
          <p className="text-xs font-medium text-orange-600">Service Support</p>
          <p className="text-[10px] text-muted-foreground">2 campos</p>
        </div>
        <div className="col-span-2 rounded-md bg-rose-500/10 p-2 text-center">
          <p className="text-xs font-medium text-rose-600">Supply Chain</p>
          <p className="text-[10px] text-muted-foreground">3 campos</p>
        </div>
      </div>
      <Button
        onClick={handleCreate}
        disabled={!name.trim() || creating}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
      >
        {creating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Crear Flujo
          </>
        )}
      </Button>
    </div>
  );
}
