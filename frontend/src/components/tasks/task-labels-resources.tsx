"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";
import { useLabels } from "@/hooks/use-data";
import { api } from "@/lib/api";
import { LabelPill } from "@/components/ui/label-pill";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TaskLabelsRow({ task, onUpdate }: { task: Task; onUpdate: (patch: Record<string, unknown>) => void }) {
  const { labels } = useLabels();
  const activeIds = task.labels.map((l) => l.id);

  const toggle = (id: string) => {
    const next = activeIds.includes(id) ? activeIds.filter((l) => l !== id) : [...activeIds, id];
    onUpdate({ labelIds: next });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      <span className="text-[13px] text-muted-foreground">Labels</span>
      {task.labels.map((l) => (
        <LabelPill key={l.id} name={l.name} />
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-5 items-center justify-center rounded border border-dashed border-border-strong text-muted-foreground hover:border-accent hover:text-accent"
          aria-label="Add label"
        >
          <Plus className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {labels.map((l) => (
            <DropdownMenuCheckboxItem key={l.id} checked={activeIds.includes(l.id)} onCheckedChange={() => toggle(l.id)}>
              {l.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TaskResourcesRow({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const resources = task.resources ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      const label = (() => {
        try {
          return new URL(url).hostname.replace("www.", "");
        } catch {
          return url;
        }
      })();
      await api.post(`/tasks/${task.id}/resources`, { label, url: url.trim() });
      setUrl("");
      setAdding(false);
      onChanged();
    } catch {
      toast.error("Enter a valid URL");
    }
  };

  return (
    <div className="mt-4">
      <span className="text-[13px] text-muted-foreground">Resources</span>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {resources.map((r) => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-accent hover:underline"
          >
            <LinkIcon className="size-3.5" />
            {r.label}
          </a>
        ))}
        {adding ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => !url && setAdding(false)}
              className="h-8"
            />
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
            <Plus className="size-3.5" />
            Add document or link…
          </button>
        )}
      </div>
    </div>
  );
}
