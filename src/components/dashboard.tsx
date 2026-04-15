"use client";

import { useAppStore, Workflow } from "@/lib/store";
import { AREA_LABEL_MAP, AREAS, HUB_AREA, DEPENDENCIES } from "@/lib/types";
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
  MoreHorizontal,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, useMemo } from "react";
import { UploadZone } from "./upload-zone";

export function Dashboard() {
  const {
    user,
    workflows,
    setWorkflows,
    notifications,
    setNotifications,
    setCurrentView,
    setSelectedWorkflowId,
    isLoading,
    setIsLoading,
    updateWorkflowInList,
    logout,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "IN_PROGRESS" | "COMPLETED">("all");
  const [showMyPending, setShowMyPending] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) setWorkflows(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [setWorkflows, setIsLoading]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [setNotifications]);

  useEffect(() => {
    fetchWorkflows();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchWorkflows, fetchNotifications]);

  const handleDeleteWorkflow = async (id: string) => {
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    setWorkflows(workflows.filter((w) => w.id !== id));
  };

  const openWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setCurrentView("workflow-detail");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Area filtering: admins see all, regular users see their area's workflows
  const visibleWorkflows = useMemo(() => {
    if (!user) return workflows;
    if (user.role === "admin") return workflows;
    // Show workflows where the user's area is the current area OR the user created it
    return workflows.filter(
      (w) =>
        w.currentArea === user.area ||
        w.createdBy === user.id ||
        w.status === "COMPLETED"
    );
  }, [workflows, user]);

  // My pending: workflows in the user's area that are in progress
  const myPendingWorkflows = useMemo(() => {
    if (!user) return [];
    return workflows.filter(
      (w) => w.currentArea === user.area && w.status === "IN_PROGRESS"
    );
  }, [workflows, user]);

  const filteredWorkflows = (showMyPending ? myPendingWorkflows : visibleWorkflows).filter((w) => {
    const ms = w.name.toLowerCase().includes(search.toLowerCase()) || w.currentArea.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "all" || w.status === filterStatus;
    return ms && mf;
  });

  const completedDeps = (w: Workflow) => {
    try { return JSON.parse(w.completedAreas || "[]") as string[]; } catch { return []; }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const areaLabel = user ? AREA_LABEL_MAP[user.area] || user.area : "";

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header - Apple frosted glass */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#007AFF] to-[#0055D4]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-semibold text-[#1D1D1F]">
              Glory Service <span className="text-[#007AFF]">Workflow</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("notifications")}
              className="relative rounded-full hover:bg-[#007AFF]/5"
            >
              <Bell className="h-[18px] w-[18px] text-[#1D1D1F]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-black/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-xs font-semibold text-white">
                    {userInitials}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#1D1D1F]">{user?.name}</p>
                  <p className="text-xs text-[#86868B]">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <div className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      className="rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: `${AREAS.find((a) => a.id === user?.area)?.color}15`,
                        color: AREAS.find((a) => a.id === user?.area)?.color,
                      }}
                    >
                      {areaLabel}
                    </Badge>
                    {user?.role === "admin" && (
                      <Badge className="rounded-full bg-[#5856D6]/10 text-[#5856D6] text-[10px]">
                        <Shield className="mr-0.5 h-2.5 w-2.5" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-[#FF3B30] cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome + Actions */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Flujos de Trabajo
            </h2>
            <p className="mt-1 text-sm text-[#86868B]">
              {user?.role === "admin"
                ? "Gestiona y da seguimiento a todos los flujos de servicio"
                : `Gestionando flujos del área: ${areaLabel}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full border-black/10 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Crear Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl border-black/5">
                <DialogHeader>
                  <DialogTitle className="text-lg text-[#1D1D1F]">Crear Flujo Manualmente</DialogTitle>
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

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "En Progreso", value: visibleWorkflows.filter((w) => w.status === "IN_PROGRESS").length, icon: Clock, color: "#007AFF", bg: "#007AFF" },
            { label: "Completados", value: visibleWorkflows.filter((w) => w.status === "COMPLETED").length, icon: CheckCircle2, color: "#34C759", bg: "#34C759" },
            { label: "Total", value: visibleWorkflows.length, icon: LayoutDashboard, color: "#5856D6", bg: "#5856D6" },
            { label: "Mis Pendientes", value: myPendingWorkflows.length, icon: Bell, color: "#FF9500", bg: "#FF9500" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-black/5 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${stat.bg}12` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1D1D1F]">{stat.value}</p>
                  <p className="text-xs text-[#86868B]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Pending Section (for non-admin users) */}
        {user?.role !== "admin" && myPendingWorkflows.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Mis Pendientes</h3>
              <Badge className="rounded-full bg-[#FF9500]/10 text-[#FF9500] text-xs">
                {myPendingWorkflows.length} en tu área
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myPendingWorkflows.slice(0, 3).map((workflow) => (
                <Card
                  key={workflow.id}
                  className="group cursor-pointer rounded-2xl border-[#FF9500]/20 bg-gradient-to-br from-white to-[#FF9500]/3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => openWorkflow(workflow.id)}
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-[#1D1D1F]">{workflow.name}</h4>
                        <p className="mt-0.5 truncate text-xs text-[#86868B]">{workflow.documentName}</p>
                      </div>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        className="rounded-full text-[11px] font-medium"
                        style={{
                          backgroundColor: `${AREAS.find((a) => a.id === workflow.currentArea)?.color}15`,
                          color: AREAS.find((a) => a.id === workflow.currentArea)?.color,
                        }}
                      >
                        {AREA_LABEL_MAP[workflow.currentArea]}
                      </Badge>
                      <span className="text-[10px] text-[#FF9500] font-medium">Requiere tu atención</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#86868B]">{workflow.fields?.length || 0} campos</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#FF9500]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]" />
            <Input
              placeholder="Buscar flujos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-black/10 bg-white pl-10 text-sm placeholder:text-[#C7C7CC]"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-black/5 bg-white p-1">
            {(["all", "IN_PROGRESS", "COMPLETED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterStatus === f
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {f === "all" ? "Todos" : f === "IN_PROGRESS" ? "Activos" : "Completados"}
              </button>
            ))}
          </div>
          {user?.role !== "admin" && (
            <button
              onClick={() => setShowMyPending(!showMyPending)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                showMyPending
                  ? "border-[#FF9500] bg-[#FF9500]/10 text-[#FF9500]"
                  : "border-black/5 bg-white text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {showMyPending ? "Ver Todos" : "Mis Pendientes"}
            </button>
          )}
        </div>

        {/* Workflow List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#007AFF] border-t-transparent" />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="rounded-2xl border-black/5 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-4 h-12 w-12 text-[#C7C7CC]" />
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Sin flujos de trabajo</h3>
              <p className="mt-1 text-sm text-[#86868B]">Crea tu primer flujo subiendo un formato o manualmente.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Card
                    className="group cursor-pointer rounded-2xl border-black/5 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => openWorkflow(workflow.id)}
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-[#1D1D1F]">{workflow.name}</h4>
                          <p className="mt-0.5 truncate text-xs text-[#86868B]">{workflow.documentName}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openWorkflow(workflow.id); }}>
                              <FileText className="mr-2 h-4 w-4" />Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/api/workflows/${workflow.id}/download`, "_blank"); }}>
                              <ArrowRight className="mr-2 h-4 w-4" />Descargar Word
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(workflow.id); }} className="text-[#FF3B30]">
                              <Trash2 className="mr-2 h-4 w-4" />Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          className="rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: `${AREAS.find((a) => a.id === workflow.currentArea)?.color}15`,
                            color: AREAS.find((a) => a.id === workflow.currentArea)?.color,
                          }}
                        >
                          {AREA_LABEL_MAP[workflow.currentArea]}
                        </Badge>
                        {workflow.status === "COMPLETED" && (
                          <Badge className="rounded-full bg-[#34C759]/10 text-[#34C759] text-[11px]">
                            Completado
                          </Badge>
                        )}
                        {workflow.currentArea === user?.area && workflow.status === "IN_PROGRESS" && (
                          <Badge className="rounded-full bg-[#FF9500]/10 text-[#FF9500] text-[11px]">
                            Tu área
                          </Badge>
                        )}
                      </div>

                      {/* Dependency completion dots */}
                      <div className="flex items-center gap-1">
                        {DEPENDENCIES.map((dep) => {
                          const cd = completedDeps(workflow);
                          const hasFields = workflow.fields?.some((f) => f.area === dep.id);
                          const isDone = cd.includes(dep.id);
                          return (
                            <div
                              key={dep.id}
                              className="h-1.5 flex-1 rounded-full transition-colors"
                              style={{
                                backgroundColor: isDone ? dep.color : hasFields ? "#E5E5EA" : "#F5F5F7",
                              }}
                              title={`${dep.label} - ${isDone ? "Completado" : "Pendiente"}`}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-[#86868B]">{workflow.fields?.length || 0} campos</span>
                        <span className="text-[11px] text-[#86868B]">
                          {new Date(workflow.updatedAt).toLocaleDateString("es-CO")}
                        </span>
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

function ManualCreateForm({ onCreate }: { onCreate: (name: string, fields: any[]) => void }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const defaultFields = [
    { label: "Nombre del Solicitante", value: "", fieldType: "text", area: "DISPATCHER", required: true },
    { label: "Correo del Solicitante", value: "", fieldType: "text", area: "DISPATCHER", required: true },
    { label: "Fecha de Recepción", value: new Date().toISOString().split("T")[0], fieldType: "date", area: "DISPATCHER", required: true },
    { label: "Descripción del Servicio", value: "", fieldType: "textarea", area: "EXECUTIVE_ACCOUNTANT", required: true },
    { label: "Cliente / Cuenta", value: "", fieldType: "text", area: "EXECUTIVE_ACCOUNTANT", required: true },
    { label: "Prioridad", value: "", fieldType: "text", area: "EXECUTIVE_ACCOUNTANT", required: false },
    { label: "Valor del Servicio", value: "", fieldType: "number", area: "EXECUTIVE_ACCOUNTANT", required: true },
    { label: "Centro de Costo", value: "", fieldType: "text", area: "FINANCE", required: false },
    { label: "Datos de Facturación", value: "", fieldType: "textarea", area: "FINANCE", required: false },
    { label: "Requisitos Operativos", value: "", fieldType: "textarea", area: "OPERATIONS", required: false },
    { label: "Fecha de Entrega", value: "", fieldType: "date", area: "OPERATIONS", required: false },
    { label: "Revisión Legal", value: "", fieldType: "textarea", area: "LEGAL", required: false },
    { label: "Recursos Técnicos", value: "", fieldType: "textarea", area: "IT", required: false },
    { label: "Proveedor Asignado", value: "", fieldType: "text", area: "SUPPLY_CHAIN", required: false },
    { label: "Observaciones de Soporte", value: "", fieldType: "textarea", area: "SERVICE_SUPPORT", required: false },
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
        <label className="text-sm font-medium text-[#1D1D1F]">Nombre del Flujo</label>
        <Input
          placeholder="Ej: Solicitud de Servicio #001"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 h-10 rounded-xl border-black/10"
        />
      </div>
      <p className="text-xs text-[#86868B]">
        Se crearán <span className="font-medium text-[#1D1D1F]">15 campos</span> distribuidos entre Dispatcher, Ejecutiva de Cuenta y las dependencias.
      </p>
      <Button
        onClick={handleCreate}
        disabled={!name.trim() || creating}
        className="w-full h-10 rounded-xl bg-[#007AFF] text-white hover:bg-[#0066E0]"
      >
        {creating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <><Plus className="mr-1.5 h-4 w-4" />Crear Flujo</>
        )}
      </Button>
    </div>
  );
}
