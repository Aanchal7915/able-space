"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UserAvatar } from "@/components/ui/avatar";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function TaskComments({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const comments = task.comments ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${task.id}/comments`, { body: body.trim() });
      setBody("");
      onChanged();
    } catch {
      toast.error("Couldn't post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <p className="text-[13px] font-medium text-foreground">Comments</p>

      <div className="mt-3 flex flex-col gap-4">
        {comments.length === 0 && <p className="text-[13px] text-muted-foreground">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <UserAvatar user={c.author} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium text-foreground">{c.author.fullName}</span>
                <span className="text-[11.5px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-foreground/90 whitespace-pre-wrap break-words">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={submit} className="mt-4 flex items-start gap-2.5">
          <UserAvatar user={user} size="sm" />
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 focus-within:border-accent">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" disabled={submitting || !body.trim()} className="text-muted-foreground hover:text-accent disabled:opacity-40">
              <Send className="size-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
