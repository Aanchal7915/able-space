"use client";

import { create } from "zustand";

export type ViewMode = "board" | "list";

export type FieldKey = "priority" | "members" | "dueDate" | "labels" | "status" | "reporter";
export type ProjectFieldKey = "priority" | "lead" | "dueDate" | "taskCount";

interface UIState {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  visibleFields: Record<FieldKey, boolean>;
  toggleField: (field: FieldKey) => void;
  visibleProjectFields: Record<ProjectFieldKey, boolean>;
  toggleProjectField: (field: ProjectFieldKey) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  addTaskDialogOpen: boolean;
  setAddTaskDialogOpen: (open: boolean, defaultStatus?: string) => void;
  addTaskDefaultStatus: string;
}

export const useUIStore = create<UIState>((set) => ({
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  viewMode: "board",
  setViewMode: (mode) => set({ viewMode: mode }),
  visibleFields: {
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  },
  toggleField: (field) =>
    set((s) => ({ visibleFields: { ...s.visibleFields, [field]: !s.visibleFields[field] } })),
  visibleProjectFields: {
    priority: true,
    lead: true,
    dueDate: true,
    taskCount: true,
  },
  toggleProjectField: (field) =>
    set((s) => ({
      visibleProjectFields: { ...s.visibleProjectFields, [field]: !s.visibleProjectFields[field] },
    })),
  activeTaskId: null,
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  addTaskDialogOpen: false,
  addTaskDefaultStatus: "todo",
  setAddTaskDialogOpen: (open, defaultStatus = "todo") =>
    set({ addTaskDialogOpen: open, addTaskDefaultStatus: defaultStatus }),
}));
