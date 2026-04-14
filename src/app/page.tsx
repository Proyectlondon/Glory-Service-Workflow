"use client";

import { useAppStore } from "@/lib/store";
import { LandingPage } from "@/components/landing";
import { Dashboard } from "@/components/dashboard";
import { WorkflowDetail } from "@/components/workflow-detail";
import { NotificationsPanel } from "@/components/notifications-panel";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const { currentView } = useAppStore();

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
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "workflow-detail" && <WorkflowDetail />}
          {currentView === "notifications" && <NotificationsPanel />}
        </motion.div>
      </AnimatePresence>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
