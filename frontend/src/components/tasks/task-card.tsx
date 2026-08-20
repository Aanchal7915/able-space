"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import type { Task } from "@/lib/types";
import { AvatarStack } from "@/components/ui/avatar";
import { DueDateBadge } from "@/components/ui/due-date-badge";
import { LabelPill } from "@/components/ui/label-pill";
import { PriorityIcon } from "@/components/ui/priority-badge";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { TaskActionsMenu } from "./task-actions-menu";

export function TaskCard({ task }: { task: Task }) {
  const setActiveTaskId = useUIStore((s) => s.setActiveTaskId);
  const visibleFields = useUIStore((s) => s.visibleFields);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const members = task.assignee ? [task.assignee, ...task.members.filter((m) => m.id !== task.assignee?.id)] : task.members;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setActiveTaskId(task.id)}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md hover:border-border-strong",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13.5px] font-medium leading-snug text-foreground">{task.title}</p>
        <TaskActionsMenu task={task}>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-surface-sunken group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
            aria-label={`Actions for ${task.title}`}
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </TaskActionsMenu>
      </div>

      {visibleFields.labels && task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((l) => (
            <LabelPill key={l.id} name={l.name} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {visibleFields.members && <AvatarStack users={members} size="xs" />}
          {visibleFields.priority && task.priority !== "no_priority" && <PriorityIcon priority={task.priority} />}
        </div>
        {visibleFields.dueDate && <DueDateBadge date={task.dueDate} />}
      </div>

      {task.subtaskCount ? (
        <div className="mt-2 text-[11px] text-muted-foreground">
          {task.subtaskCount} subtask{task.subtaskCount > 1 ? "s" : ""}
        </div>
      ) : null}
    </div>
  );
}
