"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, Lock, Eye, EyeOff, LogIn, ChevronRight } from "lucide-react";
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

const DEMO_USERS = [
  { email: "admin@glory.com", password: "123456", area: "Admin", role: "admin" },
  { email: "dispatcher@glory.com", password: "123456", area: "Dispatcher" },
  { email: "ejecutiva@glory.com", password: "123456", area: "Ejecutiva de Cuenta" },
  { email: "financiera@glory.com", password: "123456", area: "Financiera" },
  { email: "operaciones@glory.com", password: "123456", area: "Operaciones" },
  { email: "juridica@glory.com", password: "123456", area: "Juridica" },
  { email: "tecnologia@glory.com", password: "123456", area: "Tecnologia" },
  { email: "cadena@glory.com", password: "123456", area: "Cadena de Suministro" },
  { email: "soporte@glory.com", password: "123456", area: "Soporte" },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const userEmail = loginEmail || email;
    const userPassword = loginPassword || password;

    if (!userEmail || !userPassword) {
      toast.error("Ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
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

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/auth/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Error al crear usuarios");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSeeding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
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
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg shadow-[#007AFF]/20"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
              Glory Service <span className="text-[#007AFF]">Workflow</span>
            </h1>
            <p className="mt-1 text-sm text-[#86868B]">
              Inicia sesión para gestionar tus flujos de trabajo
            </p>
          </div>

          {/* Login Card */}
          <Card className="rounded-2xl border border-black/5 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F]">
                  Correo electrónico
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7C7CC]" />
                  <Input
                    type="email"
                    placeholder="correo@glory.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 rounded-xl border-black/10 bg-[#FAFAFA] pl-10 text-sm placeholder:text-[#C7C7CC]"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F]">
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
                    className="h-11 rounded-xl border-black/10 bg-[#FAFAFA] pl-10 pr-10 text-sm placeholder:text-[#C7C7CC]"
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

          {/* Demo Users Section */}
          <Card className="mt-4 rounded-2xl border border-black/5 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
                  Usuarios Demo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="text-[10px] text-[#007AFF] hover:bg-[#007AFF]/5 h-6 px-2"
                >
                  {seeding ? "Creando..." : "Crear usuarios"}
                </Button>
              </div>
              <div className="grid gap-1.5 max-h-48 overflow-y-auto pr-1">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(user.password);
                      handleLogin(user.email, user.password);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all hover:bg-[#F5F5F7] group disabled:opacity-50"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                      style={{
                        backgroundColor:
                          user.role === "admin"
                            ? "#5856D6"
                            : "#007AFF",
                      }}
                    >
                      {user.area.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1D1D1F] truncate">
                        {user.area}
                      </p>
                      <p className="text-[10px] text-[#C7C7CC] truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-[#C7C7CC]">
            Todos los usuarios demo usan la contraseña: <span className="font-medium text-[#86868B]">123456</span>
          </p>
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
            <FileText className="h-3.5 w-3.5" />
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
