"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import type { Label, Project, Task, User } from "@/lib/types";

const fetcher = <T,>(path: string) => api.get<T>(path);

export function useTasks(params: { projectId?: string; parentTaskId?: string | null; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.projectId) query.set("projectId", params.projectId);
  if (params.parentTaskId !== undefined) query.set("parentTaskId", String(params.parentTaskId));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  const { data, error, isLoading, mutate } = useSWR<Task[]>(`/tasks${qs ? `?${qs}` : ""}`, fetcher);
  return { tasks: data ?? [], error, isLoading, mutate };
}

export function useTask(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Task>(id ? `/tasks/${id}` : null, fetcher);
  return { task: data, error, isLoading, mutate };
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("/projects", fetcher);
  return { projects: data ?? [], error, isLoading, mutate };
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(id ? `/projects/${id}` : null, fetcher);
  return { project: data, error, isLoading, mutate };
}

export function useUsers() {
  const { data } = useSWR<User[]>("/users", fetcher);
  return { users: data ?? [] };
}

export function useLabels() {
  const { data } = useSWR<Label[]>("/labels", fetcher);
  return { labels: data ?? [] };
}
