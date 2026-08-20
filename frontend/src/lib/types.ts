export type TaskStatus = "todo" | "doing" | "completed" | "on_hold";
export type Priority = "no_priority" | "urgent" | "high" | "medium" | "low";
export type Theme = "light" | "dark";
export type ColorMode = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

export interface User {
  id: string;
  fullName: string;
  username: string | null;
  title: string | null;
  email: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  isGuest: boolean;
  theme: Theme;
  colorMode: ColorMode;
}

export interface Label {
  id: string;
  name: string;
  colorToken: string | null;
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  dueDate: string | null;
  lead: User | null;
  taskCount?: number;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: User;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  order: number;
  projectId: string | null;
  project?: Project | null;
  parentTaskId: string | null;
  assignee: User | null;
  reporter: User | null;
  members: User[];
  labels: Label[];
  subtaskCount?: number;
  subtasks?: Task[];
  comments?: Comment[];
  resources?: Resource[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "doing", label: "Doing" },
  { id: "completed", label: "Completed" },
  { id: "on_hold", label: "On Hold" },
];

export const PRIORITY_META: Record<Priority, { label: string; barsActive: number }> = {
  no_priority: { label: "No Priority", barsActive: 0 },
  urgent: { label: "Urgent", barsActive: 4 },
  high: { label: "High", barsActive: 3 },
  medium: { label: "Medium", barsActive: 2 },
  low: { label: "Low", barsActive: 1 },
};

export const COLOR_MODES: { id: ColorMode; label: string; swatch: string }[] = [
  { id: "amber", label: "Amber", swatch: "#d97706" },
  { id: "blue", label: "Blue", swatch: "#6d5efc" },
  { id: "pink", label: "Pink", swatch: "#db2777" },
  { id: "rose", label: "Rose", swatch: "#e11d48" },
  { id: "emerald", label: "Emerald", swatch: "#059669" },
  { id: "black", label: "Black", swatch: "#18181b" },
];
