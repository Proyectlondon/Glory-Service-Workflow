import { create } from "zustand";

export type AppView = "landing" | "dashboard" | "workflow-detail" | "notifications";

export interface WorkflowField {
  id: string;
  workflowId: string;
  label: string;
  value: string;
  fieldType: string;
  area: string;
  required: boolean;
  orderIndex: number;
  isNew?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  currentArea: string;
  status: string;
  documentName: string;
  documentData: string;
  completedAreas: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  fields: WorkflowField[];
  notifications?: AppNotification[];
  areaLogs?: AreaLog[];
  _count?: { notifications: number };
}

export interface AppNotification {
  id: string;
  workflowId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  workflow?: { id: string; name: string; currentArea: string; status: string };
}

export interface AreaLog {
  id: string;
  workflowId: string;
  fromArea: string;
  toArea: string;
  action: string;
  createdAt: string;
}

export interface AuthUser {
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

interface AppState {
  // Auth
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (id: string | null) => void;

  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[]) => void;
  updateWorkflowInList: (workflow: Workflow) => void;

  notifications: AppNotification[];
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationsRead: (ids: string[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => {
    localStorage.removeItem("glory-token");
    localStorage.removeItem("glory-user");
    set({ user: null, token: null, isAuthenticated: false, currentView: "dashboard" });
  },

  // Navigation
  currentView: "dashboard",
  setCurrentView: (view) => set({ currentView: view }),

  selectedWorkflowId: null,
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),

  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),
  updateWorkflowInList: (workflow) =>
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === workflow.id ? workflow : w)),
    })),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, read: true } : n
      ),
    })),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  toast: null,
  showToast: (message, type = "success") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));

// Initialize auth from localStorage
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("glory-token");
  const savedUser = localStorage.getItem("glory-user");

  if (savedToken && savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      useAppStore.setState({
        user: parsedUser,
        token: savedToken,
        isAuthenticated: true,
      });

      // Validate token with server
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((user) => {
          useAppStore.setState({ user });
          localStorage.setItem("glory-user", JSON.stringify(user));
        })
        .catch(() => {
          localStorage.removeItem("glory-token");
          localStorage.removeItem("glory-user");
          useAppStore.setState({ user: null, token: null, isAuthenticated: false });
        });
    } catch {
      localStorage.removeItem("glory-token");
      localStorage.removeItem("glory-user");
    }
  }
}
