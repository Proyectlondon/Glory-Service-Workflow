"use client";

import { useAppStore, AuthUser } from "@/lib/store";
import { LoginPage } from "@/components/login-page";
import { LandingPage } from "@/components/landing";
import { Dashboard } from "@/components/dashboard";
import { WorkflowDetail } from "@/components/workflow-detail";
import { NotificationsPanel } from "@/components/notifications-panel";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

export default function Home() {
  const { currentView, isAuthenticated, setUser, setToken, logout } = useAppStore();
  const [authChecked, setAuthChecked] = useState(isAuthenticated);

  const handleLogin = (user: AuthUser, token: string) => {
    setUser(user);
    setToken(token);
    setAuthChecked(true);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="bottom-right" richColors closeButton />
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === "landing" && <LandingPage />}
          {(currentView === "dashboard" || currentView === "users" || currentView === "templates") && <Dashboard />}
          {currentView === "workflow-detail" && <WorkflowDetail />}
          {currentView === "notifications" && <NotificationsPanel />}
        </motion.div>
      </AnimatePresence>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
