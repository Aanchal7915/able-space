"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/ui-store";
import { useTask } from "@/hooks/use-data";
import { api } from "@/lib/api";
import { Textarea } from "@/components/ui/input";
import { TaskDetailsPanel } from "./task-details-panel";
import { TaskSubtasks } from "./task-subtasks";
import { TaskComments } from "./task-comments";
import { TaskLabelsRow, TaskResourcesRow } from "./task-labels-resources";

export function TaskDetailDrawer() {
  const activeTaskId = useUIStore((s) => s.activeTaskId);
  const setActiveTaskId = useUIStore((s) => s.setActiveTaskId);
  const { task, mutate } = useTask(activeTaskId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-seed the editable draft whenever a different task is opened (keyed
    // on task?.id, not the whole object, so in-flight edits to the current
    // task aren't clobbered by its own refetch).
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(task.title);
      setDescription(task.description ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveTaskId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActiveTaskId]);

  if (!activeTaskId) return null;

  const patch = async (body: Record<string, unknown>) => {
    mutate((current) => (current ? { ...current, ...body } as typeof current : current), false);
    try {
      await api.patch(`/tasks/${activeTaskId}`, body);
    } finally {
      mutate();
    }
  };

  const saveTitle = () => {
    if (task && title.trim() && title !== task.title) patch({ title: title.trim() });
  };

  const saveDescription = () => {
    if (task && description !== (task.description ?? "")) patch({ description });
  };

  const remove = async () => {
    if (!task) return;
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    await api.delete(`/tasks/${task.id}`);
    setActiveTaskId(null);
    toast.success("Task deleted");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-overlay animate-fade-in" onClick={() => setActiveTaskId(null)} />
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-[820px] animate-slide-in-right flex-col bg-surface shadow-2xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            {task?.project && <span>{task.project.name}</span>}
            {task?.parentTaskId && <span>Subtask</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={remove} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-danger">
              <Trash2 className="size-4" />
            </button>
            <button onClick={() => setActiveTaskId(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {!task ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto scrollbar-thin px-5 py-5 lg:flex-row lg:px-6">
            <div className="min-w-0 flex-1">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                rows={1}
                className="w-full resize-none overflow-hidden bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Task title"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                placeholder="Add a description…"
                rows={3}
                className="mt-2 border-none px-0 text-[13.5px] leading-relaxed text-muted focus:ring-0"
              />

              <TaskLabelsRow task={task} onUpdate={patch} />
              <TaskResourcesRow task={task} onChanged={() => mutate()} />
              <TaskSubtasks task={task} onChanged={() => mutate()} />
              <TaskComments task={task} onChanged={() => mutate()} />
            </div>

            <TaskDetailsPanel task={task} onUpdate={patch} />
          </div>
        )}
      </div>
    </div>
  );
}
