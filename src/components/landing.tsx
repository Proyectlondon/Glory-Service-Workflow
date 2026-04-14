"use client";

import { useAppStore } from "@/lib/store";
import { AREAS, AREA_LABEL_MAP, AREA_ORDER } from "@/lib/types";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Bell,
  Zap,
  Shield,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { setCurrentView } = useAppStore();

  const areaColors = [
    "from-blue-500/20 to-blue-600/5",
    "from-purple-500/20 to-purple-600/5",
    "from-green-500/20 to-green-600/5",
    "from-orange-500/20 to-orange-600/5",
    "from-rose-500/20 to-rose-600/5",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/glory-logo.png" alt="Glory Service Workflow" className="h-9 w-9 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Glory Service <span className="text-amber-500">Workflow</span>
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Gestión inteligente de flujos de servicio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("dashboard")}
              className="hidden sm:inline-flex"
            >
              Iniciar Sesión
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentView("dashboard")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md"
            >
              Comenzar Ahora
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600">
              <Zap className="h-4 w-4" />
              Plataforma MVP de productividad empresarial
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Transforma la gestión de{" "}
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                flujos de servicio
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Sube formatos en Word, edítalos colaborativamente entre áreas, y descarga documentos
              completamente diligenciados. Automatiza notificaciones y elimina retrabajos.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setCurrentView("dashboard")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 px-8 py-6 text-base"
              >
                <FileText className="mr-2 h-5 w-5" />
                Crear Flujo de Trabajo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 px-8 py-6 text-base"
              >
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-foreground">Cómo Funciona</h3>
          <p className="mt-3 text-muted-foreground">Cuatro pasos simples para automatizar tu flujo de trabajo</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileText,
              title: "Sube tu Formato",
              desc: "Carga cualquier formato en Word (.docx) y el sistema extrae automáticamente los campos.",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: Users,
              title: "Flujo entre Áreas",
              desc: "El formato pasa por Dispatcher, Service Executive, Accountant, Service Support y Supply Chain.",
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: Bell,
              title: "Notificaciones en Tiempo Real",
              desc: "Cada área recibe alertas cuando le corresponde actuar y al guardar cambios.",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              icon: CheckCircle2,
              title: "Descarga Completa",
              desc: "Al completar el flujo, descarga el formato Word totalmente diligenciado por todas las áreas.",
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-amber-500/30 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-lg p-3 ${step.bg}`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">
                  {i + 1}
                </span>
                <h4 className="font-semibold text-foreground">{step.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Areas Flow */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-foreground">Flujo de Áreas</h3>
            <p className="mt-3 text-muted-foreground">
              Cada formato recorre las 5 áreas clave para su diligenciamiento completo
            </p>
          </motion.div>

          <div className="mt-12 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-2">
            {AREAS.map((area, i) => (
              <div key={area.id} className="flex items-center gap-2 lg:gap-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex flex-col items-center rounded-xl border border-border/60 bg-gradient-to-br ${areaColors[i]} p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg lg:min-w-[160px]`}
                >
                  <div className={`mb-2 rounded-full ${area.color} p-2.5`}>
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{area.label}</span>
                  <span className="mt-1 text-center text-xs text-muted-foreground hidden lg:block">
                    {area.description}
                  </span>
                </motion.div>
                {i < AREAS.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 hidden lg:block flex-shrink-0" />
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground/50 lg:hidden flex-shrink-0 rotate-90" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/60 bg-card p-8"
          >
            <Shield className="mb-4 h-8 w-8 text-amber-500" />
            <h4 className="mb-3 text-xl font-bold text-foreground">Control Total del Proceso</h4>
            <p className="text-muted-foreground">
              Supervisa en tiempo real el estado de cada formato. Sabrá exactamente en qué área se encuentra,
              qué falta por diligenciar y cuándo se completará. El tablero de control centralizado le da
              visibilidad completa de todos los flujos activos.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/60 bg-card p-8"
          >
            <Clock className="mb-4 h-8 w-8 text-amber-500" />
            <h4 className="mb-3 text-xl font-bold text-foreground">Ahorro de Tiempo</h4>
            <p className="text-muted-foreground">
              Elimina la necesidad de enviar correos, imprimir documentos o hacer seguimiento manual.
              Cada área recibe notificaciones automáticas y puede editar su parte directamente en el sistema,
              reduciendo tiempos de respuesta hasta en un 70%.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-10 text-center"
          >
            <h3 className="text-3xl font-bold text-foreground">
              ¿Listo para transformar tus flujos de servicio?
            </h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Comience ahora mismo a gestionar sus formatos de manera inteligente y eficiente.
            </p>
            <Button
              size="lg"
              onClick={() => setCurrentView("dashboard")}
              className="mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 px-10 py-6 text-base"
            >
              Comenzar Gratis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/glory-logo.png" alt="" className="h-6 w-6 rounded" />
              <span className="text-sm font-semibold text-foreground">
                Glory Service Workflow
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              MVP de productividad empresarial &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
