"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PRIORITY_META, type Priority } from "@/lib/types";
import { useUsers } from "@/hooks/use-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { users } = useUsers();
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<Priority>("no_priority");
  const [leadId, setLeadId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/projects", {
        name: name.trim(),
        priority,
        leadId: leadId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      toast.success("Project created");
      setName("");
      setPriority("no_priority");
      setLeadId("");
      setDueDate("");
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error("Couldn't create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-6">
        <DialogTitle>Add Project</DialogTitle>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <Input autoFocus placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-muted-foreground">Priority</span>
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
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-muted-foreground">Lead</span>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent"
              >
                <option value="">No lead</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-muted-foreground">Due Date</span>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
