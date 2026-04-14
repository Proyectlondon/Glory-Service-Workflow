"use client";

import { useAppStore } from "@/lib/store";
import { AREA_LABEL_MAP } from "@/lib/types";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ArrowRight,
  Download,
  Clock,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationsPanel() {
  const {
    notifications,
    setNotifications,
    markNotificationsRead,
    setCurrentView,
    setSelectedWorkflowId,
  } = useAppStore();

  const [filter, setFilter] = useState<"all" | "unread">("all");

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
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    markNotificationsRead(unreadIds);
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });
    } catch (e) {
      console.error("Error marking notifications read:", e);
    }
  };

  const handleClearRead = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      fetchNotifications();
    } catch (e) {
      console.error("Error clearing notifications:", e);
    }
  };

  const openWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setCurrentView("workflow-detail");
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "area_change":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case "save":
        return <Download className="h-4 w-4 text-green-500" />;
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return "bg-background";
    switch (type) {
      case "area_change":
        return "bg-blue-500/5";
      case "complete":
        return "bg-amber-500/5";
      default:
        return "bg-green-500/5";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentView("dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <h1 className="text-base font-semibold text-foreground">Notificaciones</h1>
              {unreadCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {unreadCount} nuevas
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                Marcar todas leídas
              </Button>
            )}
            {notifications.some((n) => n.read) && (
              <Button variant="ghost" size="sm" onClick={handleClearRead} className="text-red-500 hover:text-red-600">
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Filter */}
        <div className="mb-4 flex gap-2">
          <div className="flex rounded-lg border border-border/60 bg-card p-0.5">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "Todas" : "No leídas"}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {filter === "unread" ? "No hay notificaciones sin leer" : "No hay notificaciones"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Las notificaciones aparecerán aquí cuando se creen o actualicen flujos de trabajo.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    className={`border-border/40 cursor-pointer transition-all hover:shadow-sm ${getNotificationBg(
                      notification.type,
                      notification.read
                    )} ${!notification.read ? "border-l-2 border-l-amber-500" : ""}`}
                    onClick={() => openWorkflow(notification.workflowId)}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="mt-0.5 rounded-lg bg-muted/50 p-2">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-foreground`}>
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.workflow && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {notification.workflow.name}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
