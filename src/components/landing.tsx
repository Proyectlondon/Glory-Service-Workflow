"use client";

import { useAppStore } from "@/lib/store";
import { AREAS, DEPENDENCIES } from "@/lib/types";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Bell,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Mail,
  UserCheck,
  DollarSign,
  Settings,
  Package,
  Headphones,
  Cpu,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { setCurrentView } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header - Apple style frosted glass */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#007AFF] to-[#0055D4] shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
              Glory Service <span className="text-[#007AFF]">Workflow</span>
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setCurrentView("dashboard")}
            className="rounded-full px-5 text-sm font-medium text-[#007AFF] hover:bg-[#007AFF]/5"
          >
            Open App
          </Button>
        </div>
      </header>

      {/* Hero - Clean Apple aesthetic */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="" className="h-full w-full object-cover opacity-60" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center sm:pt-32 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#007AFF]/8 px-4 py-1.5 text-sm font-medium text-[#007AFF]">
              <Zap className="h-3.5 w-3.5" />
              MVP de Productividad Empresarial
            </div>
            <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-[#1D1D1F] sm:text-6xl lg:text-7xl">
              Flujos de servicio,
              <br />
              <span className="bg-gradient-to-r from-[#007AFF] to-[#5856D6] bg-clip-text text-transparent">
                simplificados.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#86868B] sm:text-xl">
              Sube formatos en Word, procesa la información entre áreas y descarga documentos
              completamente diligenciados. Sin complicaciones.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setCurrentView("dashboard")}
                className="rounded-full bg-[#007AFF] px-8 py-6 text-base font-medium text-white shadow-lg shadow-[#007AFF]/25 hover:bg-[#0066E0]"
              >
                Comenzar Ahora
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-8 py-6 text-base font-medium text-[#007AFF]"
              >
                Conocer más
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works - Clean steps */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[#007AFF]">Cómo funciona</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#1D1D1F] sm:text-5xl">
            Tres pasos. Cero complicaciones.
          </h2>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Recibe y registra",
              desc: "Dispatcher recibe el formato por correo, lo sube al sistema y lo envía a la Ejecutiva de Cuenta para su procesamiento.",
              num: "01",
            },
            {
              icon: UserCheck,
              title: "Procesa y escala",
              desc: "La Ejecutiva llena lo que puede. Si falta información, escala a las dependencias correspondientes con un clic.",
              num: "02",
            },
            {
              icon: CheckCircle2,
              title: "Completa y descarga",
              desc: "Las dependencias devuelven la info. La Ejecutiva finaliza y descarga el Word completamente diligenciado.",
              num: "03",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all group-hover:shadow-md group-hover:ring-[#007AFF]/20">
                <step.icon className="h-7 w-7 text-[#007AFF]" />
              </div>
              <span className="text-xs font-bold text-[#007AFF]/60">{step.num}</span>
              <h3 className="mt-1 text-lg font-semibold text-[#1D1D1F]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#86868B]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hub & Spoke Visual */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-sm font-medium uppercase tracking-wider text-[#007AFF]">Modelo de flujo</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Hub & Spoke inteligente
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#86868B]">
              La Ejecutiva de Cuenta es el centro. Escala a dependencias y recibe respuestas automáticamente.
            </p>
          </motion.div>

          {/* Visual hub-spoke diagram */}
          <div className="relative mx-auto max-w-lg">
            {/* Center - Executive Accountant */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-10 mx-auto flex flex-col items-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#007AFF] to-[#0055D4] shadow-xl shadow-[#007AFF]/20">
                <UserCheck className="h-10 w-10 text-white" />
              </div>
              <span className="mt-3 text-sm font-semibold text-[#1D1D1F]">Ejecutiva de Cuenta</span>
              <span className="text-xs text-[#86868B]">Centro de operaciones</span>
            </motion.div>

            {/* Spokes - Dependencies in a circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-72 w-72">
                {DEPENDENCIES.map((dep, i) => {
                  const angle = (i / DEPENDENCIES.length) * 2 * Math.PI - Math.PI / 2;
                  const x = Math.cos(angle) * 140;
                  const y = Math.sin(angle) * 140;
                  const Icon = { DollarSign, Settings, Shield, Cpu, Package, Headphones }[dep.icon as keyof typeof import("lucide-react")] || Settings;

                  return (
                    <motion.div
                      key={dep.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/5"
                          style={{ boxShadow: `0 4px 12px ${dep.color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: dep.color }} />
                        </div>
                        <span className="text-[10px] font-medium text-[#86868B] text-center leading-tight w-20">
                          {dep.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Lines from center to dependencies */}
                <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
                  {DEPENDENCIES.map((dep, i) => {
                    const angle = (i / DEPENDENCIES.length) * 2 * Math.PI - Math.PI / 2;
                    const x2 = 144 + Math.cos(angle) * 95;
                    const y2 = 144 + Math.sin(angle) * 95;
                    return (
                      <line
                        key={dep.id}
                        x1="144"
                        y1="144"
                        x2={x2}
                        y2={y2}
                        stroke={dep.color}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Dispatcher → EA arrow */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-[#F5F5F7] px-4 py-2 ring-1 ring-black/5">
              <Mail className="h-4 w-4 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#1D1D1F]">Dispatcher</span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#007AFF]" />
            <div className="flex items-center gap-2 rounded-xl bg-[#007AFF]/8 px-4 py-2 ring-1 ring-[#007AFF]/20">
              <UserCheck className="h-4 w-4 text-[#007AFF]" />
              <span className="text-sm font-medium text-[#007AFF]">Ejecutiva de Cuenta</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-[#007AFF]/8 px-4 py-2 ring-1 ring-[#007AFF]/20">
              <UserCheck className="h-4 w-4 text-[#007AFF]" />
              <span className="text-sm font-medium text-[#007AFF]">Ejecutiva</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5 text-[#34C759]" />
            </div>
            <span className="text-xs text-[#86868B]">Escala</span>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5 text-[#34C759]" />
            </div>
            <span className="rounded-lg bg-[#34C759]/10 px-2 py-1 text-xs font-medium text-[#34C759]">Dependencia</span>
            <div className="flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5 text-[#FF9500]" />
            </div>
            <span className="text-xs text-[#86868B]">Devuelve</span>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5 text-[#FF9500]" />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#007AFF]/8 px-4 py-2 ring-1 ring-[#007AFF]/20">
              <UserCheck className="h-4 w-4 text-[#007AFF]" />
              <span className="text-sm font-medium text-[#007AFF]">Ejecutiva</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Apple Bento Grid style */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[#007AFF]">Características</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#1D1D1F]">
            Todo lo que necesitas.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white p-8 ring-1 ring-black/5 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10">
              <Shield className="h-5 w-5 text-[#007AFF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Control total</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
              Supervisa en tiempo real cada formato. Sabrás en qué área está, qué falta por diligenciar y el historial completo de escalamientos.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white p-8 ring-1 ring-black/5 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF9500]/10">
              <Zap className="h-5 w-5 text-[#FF9500]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Escalamiento inteligente</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
              La Ejecutiva escala a cualquier dependencia con un clic. Las dependencias devuelven automáticamente la información y ella continúa.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white p-8 ring-1 ring-black/5 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#34C759]/10">
              <Bell className="h-5 w-5 text-[#34C759]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Notificaciones en tiempo real</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
              Alertas automáticas al escalar, recibir respuesta y completar. Nunca pierdes el rastro de ningún formato.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-white p-8 ring-1 ring-black/5 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#AF52DE]/10">
              <FileText className="h-5 w-5 text-[#AF52DE]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Word nativo</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#86868B]">
              Sube formatos .docx y descarga documentos profesionales completamente diligenciados con tablas por área y estado de cada campo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-12 text-center shadow-xl shadow-[#007AFF]/20 sm:p-16"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Transforma tus flujos de servicio
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/70">
            Comienza ahora a gestionar formatos de manera inteligente, colaborativa y sin retrabajos.
          </p>
          <Button
            size="lg"
            onClick={() => setCurrentView("dashboard")}
            className="mt-8 rounded-full bg-white px-8 py-6 text-base font-medium text-[#007AFF] shadow-lg hover:bg-white/90"
          >
            Comenzar Gratis
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#007AFF] to-[#0055D4]">
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#1D1D1F]">Glory Service Workflow</span>
            </div>
            <p className="text-xs text-[#86868B]">MVP de productividad empresarial &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
