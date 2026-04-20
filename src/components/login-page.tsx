"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface LoginUser {
  id: string;
  name: string;
  email: string;
  area: string;
  role: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginPageProps {
  onLogin: (user: LoginUser, token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      localStorage.setItem("glory-token", data.token);
      localStorage.setItem("glory-user", JSON.stringify(data.user));
      toast.success(`Bienvenido, ${data.user.name}`);
      onLogin(data.user, data.token);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-4 flex h-20 w-auto items-center justify-center p-2"
            >
              <img src="/corporate-logo.png" alt="Glory Logo" className="h-full object-contain" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Workflow de Servicios
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión para gestionar tus flujos de trabajo
            </p>
          </div>

          {/* Login Card */}
          <Card className="rounded-2xl border border-black/5 dark:border-white/10 bg-card shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Usuario o Correo
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7C7CC]" />
                  <Input
                    type="text"
                    placeholder="ej: admin o correo@glory.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 rounded-xl border-black/10 dark:border-white/10 bg-muted pl-10 text-sm placeholder:text-[#C7C7CC]"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7C7CC]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 rounded-xl border-black/10 dark:border-white/10 bg-muted pl-10 pr-10 text-sm placeholder:text-[#C7C7CC]"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#86868B]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={() => handleLogin()}
                disabled={loading || !email || !password}
                className="w-full h-11 rounded-xl bg-[#007AFF] text-white text-sm font-medium shadow-sm shadow-[#007AFF]/20 hover:bg-[#0066E0] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right - Decorative Panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#007AFF] to-[#5856D6] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/3" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 max-w-md px-12 text-white"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <img src="/corporate-logo.png" alt="Glory Icon" className="h-5 w-auto" />
            MVP de Productividad
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Flujos de servicio,
            <br />
            simplificados.
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            Sube formatos Word, procesa la información entre áreas y descarga documentos completamente diligenciados.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#34C759]" />
              8 áreas integradas
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#FF9500]" />
              Tiempo real
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
