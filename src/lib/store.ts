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

interface AppState {
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

export const useAppStore = create<AppState>((set) => ({
  currentView: "landing",
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
