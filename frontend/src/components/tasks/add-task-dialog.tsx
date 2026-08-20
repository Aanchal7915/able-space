"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/ui-store";
import { useUsers } from "@/hooks/use-data";
import { api } from "@/lib/api";
import { PRIORITY_META, STATUS_COLUMNS, type Priority, type TaskStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { mutate as globalMutate } from "swr";

export function AddTaskDialog({ projectId }: { projectId?: string }) {
  const { addTaskDialogOpen, setAddTaskDialogOpen, addTaskDefaultStatus } = useUIStore();
  const { users } = useUsers();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("no_priority");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("no_priority");
    setAssigneeId("");
    setDueDate("");
  };

  const onOpenChange = (open: boolean) => {
    setAddTaskDialogOpen(open, addTaskDefaultStatus);
    if (open) setStatus((addTaskDefaultStatus as TaskStatus) || "todo");
    if (!open) reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        projectId,
      });
      globalMutate((key) => typeof key === "string" && key.startsWith("/tasks"));
      toast.success("Task created");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={addTaskDialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-6">
        <DialogTitle>Add Task</DialogTitle>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description (optional)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent"
              >
                {STATUS_COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent"
              >
                {Object.entries(PRIORITY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assignee">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Due Date">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
