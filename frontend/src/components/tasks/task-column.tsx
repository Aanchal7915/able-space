"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<TaskStatus, string> = {
  todo: "bg-zinc-400",
  doing: "bg-amber-500",
  completed: "bg-emerald-500",
  on_hold: "bg-rose-500",
};

export function TaskColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });
  const setAddTaskDialogOpen = useUIStore((s) => s.setAddTaskDialogOpen);

  return (
    <div className="flex w-[290px] shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", DOT_COLOR[status])} />
          <span className="text-[13px] font-medium text-foreground">{label}</span>
          <span className="text-[12px] text-muted-foreground">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setAddTaskDialogOpen(true, status)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
            title={`Add task to ${label}`}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors min-h-[80px]",
          isOver && "bg-accent-soft/40"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        <button
          onClick={() => setAddTaskDialogOpen(true, status)}
          className="mt-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add Task
        </button>
      </div>
    </div>
  );
}
