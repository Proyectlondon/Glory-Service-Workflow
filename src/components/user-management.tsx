"use client";

import { useState, useEffect } from "react";
import { useAppStore, AuthUser } from "@/lib/store";
import { AREAS, AREA_LABEL_MAP } from "@/lib/types";
import { 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  Trash2, 
  ArrowLeft,
  Lock,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export function UserManagement() {
  const { setCurrentView, token } = useAppStore();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    area: "DISPATCHER",
    role: "user"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error("Error al cargar usuarios");
      }
    } catch (e) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Usuario creado exitosamente");
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", password: "", area: "DISPATCHER", role: "user" });
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear usuario");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/auth/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      if (res.ok) {
        toast.success("Usuario eliminado");
        setUserToDelete(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar usuario");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const filteredUsers = users.filter(u => {
    const name = u?.name || "Usuario sin nombre";
    const email = u?.email || "";
    return name.toLowerCase().includes(search.toLowerCase()) || 
           email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentView("dashboard")}
            className="rounded-full hover:bg-black/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-muted-foreground">
              Añade y administra las personas que usarán la plataforma
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#007AFF] text-white hover:bg-[#0066E0]">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input 
                    placeholder="Ej: Juan Pérez" 
                    className="pl-10 border-border bg-background text-foreground"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input 
                    type="email" 
                    placeholder="correo@glory.com" 
                    className="pl-10 border-border bg-background text-foreground"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contraseña Inicial</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    className="pl-10 border-border bg-background text-foreground"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Área</label>
                  <Select 
                    value={formData.area} 
                    onValueChange={v => setFormData({ ...formData, area: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AREA_LABEL_MAP).map(([id, label]) => (
                        <SelectItem key={id} value={id}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select 
                    value={formData.role} 
                    onValueChange={v => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario Estándar</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4 rounded-xl bg-primary text-white hover:bg-primary/90">
                Crear Usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6 rounded-2xl border-black/5 dark:border-white/10 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]" />
            <Input 
              placeholder="Buscar usuarios por nombre o correo..." 
              className="pl-10 bg-transparent border-none focus-visible:ring-0 text-base"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#007AFF] border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No se encontraron usuarios.</p>
        ) : (
          filteredUsers.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border-black/5 dark:border-white/10 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                      {(u?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{u?.name || "Sin nombre"}</h4>
                      <p className="text-sm text-muted-foreground">{u?.email || "Sin correo"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge 
                        variant="secondary"
                        className="rounded-full text-xs"
                        style={{
                          backgroundColor: `${AREAS.find(a => a.id === u?.area)?.color || "#E5E5EA"}25`,
                          color: AREAS.find(a => a.id === u?.area)?.color || "#94A3B8",
                        }}
                      >
                        {AREA_LABEL_MAP[u?.area || ""] || u?.area || "Sin área"}
                      </Badge>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">
                        {u.role === "admin" && (
                          <span className="flex items-center gap-1 text-[#5856D6]">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                        {u.role !== "admin" && <span>Usuario</span>}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-[#FF3B30] hover:bg-[#FF3B30]/5 rounded-full"
                      onClick={() => setUserToDelete({ id: u.id, name: u.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">¿Eliminar usuario?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Estás a punto de eliminar a <span className="font-semibold text-foreground">{userToDelete?.name}</span>. 
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl"
              onClick={() => setUserToDelete(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteUser}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
