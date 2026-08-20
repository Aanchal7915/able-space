"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";
import { api } from "@/lib/api";
import { AvatarStack } from "@/components/ui/avatar";
import { DueDateBadge } from "@/components/ui/due-date-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";

export function TaskSubtasks({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setActiveTaskId = useUIStore((s) => s.setActiveTaskId);
  const subtasks = task.subtasks ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${task.id}/subtasks`, { title: title.trim() });
      setTitle("");
      setAdding(false);
      onChanged();
    } catch {
      toast.error("Couldn't add subtask");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        Subtasks
        {subtasks.length > 0 && <span className="text-muted-foreground">({subtasks.length})</span>}
      </button>

      {open && (
        <>
          {subtasks.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-sunken text-[11.5px] text-muted-foreground">
                    <th className="px-3 py-1.5 font-medium">Task</th>
                    <th className="hidden px-3 py-1.5 font-medium sm:table-cell">Priority</th>
                    <th className="hidden px-3 py-1.5 font-medium sm:table-cell">Members</th>
                    <th className="px-3 py-1.5 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subtasks.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setActiveTaskId(s.id)}
                      className="cursor-pointer border-b border-border last:border-0 text-[13px] hover:bg-surface-sunken"
                    >
                      <td className="px-3 py-2 text-foreground">{s.title}</td>
                      <td className="hidden px-3 py-2 sm:table-cell">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="hidden px-3 py-2 sm:table-cell">
                        <AvatarStack users={s.assignee ? [s.assignee] : []} size="xs" />
                      </td>
                      <td className="px-3 py-2">
                        <DueDateBadge date={s.dueDate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adding ? (
            <form onSubmit={submit} className="mt-2 flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Subtask title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => !title && setAdding(false)}
              />
              <Button size="sm" type="submit" disabled={submitting || !title.trim()}>
                Add
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
              Add Subtasks
            </button>
          )}
        </>
      )}
    </div>
  );
}
