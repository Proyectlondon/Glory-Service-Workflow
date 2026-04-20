"use client";

import { useAppStore } from "@/lib/store";
import { AREA_LABEL_MAP, AREA_COLOR_MAP } from "@/lib/types";
import { ArrowLeft, Bell, CheckCircle2, ArrowRight, Download, Clock, Trash2, Info, Send, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationsPanel() {
  const { user, notifications, setNotifications, markNotificationsRead, setCurrentView, setSelectedWorkflowId } = useAppStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error(e); }
  }, [setNotifications]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (ids.length === 0) return;
    markNotificationsRead(ids);
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
  };

  const handleMarkSingleRead = async (notifId: string) => {
    markNotificationsRead([notifId]);
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [notifId] }) });
  };

  const handleClearRead = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    fetchNotifications();
  };

  const openWorkflow = (id: string) => { setSelectedWorkflowId(id); setCurrentView("workflow-detail"); };

  // Filter notifications: show all for admin, for regular users show notifications that mention their area
  const relevantNotifications = useMemo(() => {
    if (!user || user.role === "admin") return notifications;
    return notifications;
    // All notifications are shown for now, but in the UI we highlight area-relevant ones
  }, [notifications, user]);

  const filtered = filter === "unread"
    ? relevantNotifications.filter((n) => !n.read)
    : relevantNotifications;
  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  // Check if a notification is relevant to the current user's area
  const isRelevant = (n: { message: string; type: string }) => {
    if (!user || user.role === "admin") return true;
    const areaLabel = AREA_LABEL_MAP[user.area] || "";
    return n.message.toLowerCase().includes(areaLabel.toLowerCase());
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "escalation": return <Send className="h-4 w-4 text-[#FF9500]" />;
      case "return": return <RotateCcw className="h-4 w-4 text-[#007AFF]" />;
      case "area_change": return <ArrowRight className="h-4 w-4 text-[#007AFF]" />;
      case "complete": return <CheckCircle2 className="h-4 w-4 text-[#34C759]" />;
      case "save": return <Download className="h-4 w-4 text-[#34C759]" />;
      default: return <Info className="h-4 w-4 text-[#86868B]" />;
    }
  };

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => setCurrentView("dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-base font-semibold text-foreground">Notificaciones</h1>
              {unreadCount > 0 && <Badge className="rounded-full bg-primary/10 text-primary text-[11px]">{unreadCount}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-xs text-[#007AFF]" onClick={handleMarkAllRead}>Leer todas</Button>}
            {notifications.some((n) => n.read) && <Button variant="ghost" size="sm" className="text-xs text-[#FF3B30]" onClick={handleClearRead}><Trash2 className="mr-1 h-3 w-3" />Limpiar</Button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-6">
        {/* User area context */}
        {user && user.role !== "admin" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#007AFF]/5 px-4 py-2">
            <Badge
              className="rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: `${AREA_COLOR_MAP[user.area]}15`,
                color: AREA_COLOR_MAP[user.area],
              }}
            >
              {AREA_LABEL_MAP[user.area]}
            </Badge>
            <span className="text-xs text-muted-foreground">Mostrando todas las notificaciones</span>
          </div>
        )}

        <div className="mb-4 flex gap-1">
          <div className="flex rounded-xl border border-black/5 bg-white p-1">
            {(["all", "unread"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === f ? "bg-[#007AFF] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? "Todas" : "No leídas"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <Card className="rounded-2xl border-black/5 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center py-20 text-center">
                  <Bell className="mb-4 h-12 w-12 text-[#C7C7CC]" />
                  <h3 className="text-lg font-semibold text-foreground">Sin notificaciones</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Las notificaciones aparecerán aquí.</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((n, i) => {
                const relevant = isRelevant(n);
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                    <Card
                      className={`cursor-pointer rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md ${!n.read ? "ring-1 ring-primary/20" : ""}`}
                      onClick={() => { openWorkflow(n.workflowId); handleMarkSingleRead(n.id); }}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7]">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${!n.read ? "font-semibold text-[#1D1D1F]" : "font-medium text-[#3A3A3C]"}`}>{n.message}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-[#C7C7CC]" />
                            <span className="text-[11px] text-[#86868B]">{formatTime(n.createdAt)}</span>
                            {n.workflow && <Badge className="rounded-full bg-[#F5F5F7] text-[#86868B] text-[10px] px-1.5">{n.workflow.name}</Badge>}
                            {relevant && user?.role !== "admin" && (
                              <Badge className="rounded-full bg-[#FF9500]/10 text-[#FF9500] text-[10px] px-1.5">Tu área</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
