"use client";

import { useState } from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { STATUS_COLUMNS, type Task, type TaskStatus } from "@/lib/types";
import { AvatarStack } from "@/components/ui/avatar";
import { DueDateBadge } from "@/components/ui/due-date-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { LabelPill } from "@/components/ui/label-pill";
import { TaskActionsMenu } from "./task-actions-menu";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<TaskStatus, string> = {
  todo: "bg-zinc-400",
  doing: "bg-amber-500",
  completed: "bg-emerald-500",
  on_hold: "bg-rose-500",
};

export function TaskListView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-6">
      {STATUS_COLUMNS.map((col) => (
        <StatusGroup
          key={col.id}
          status={col.id}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order)}
        />
      ))}
    </div>
  );
}

function StatusGroup({ status, label, tasks }: { status: TaskStatus; label: string; tasks: Task[] }) {
  const [open, setOpen] = useState(true);
  const visibleFields = useUIStore((s) => s.visibleFields);
  const setActiveTaskId = useUIStore((s) => s.setActiveTaskId);
  const setAddTaskDialogOpen = useUIStore((s) => s.setAddTaskDialogOpen);

  return (
    <div className="pt-4">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 py-1.5">
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        <span className={cn("size-2 rounded-full", DOT_COLOR[status])} />
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="text-[12px] text-muted-foreground">{tasks.length}</span>
      </button>

      {open && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface-sunken text-[12px] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Task</th>
                {visibleFields.priority && <th className="hidden px-3 py-2 font-medium sm:table-cell">Priority</th>}
                {visibleFields.members && <th className="hidden px-3 py-2 font-medium md:table-cell">Members</th>}
                {visibleFields.dueDate && <th className="hidden px-3 py-2 font-medium sm:table-cell">Due Date</th>}
                {visibleFields.labels && <th className="hidden px-3 py-2 font-medium lg:table-cell">Labels</th>}
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className="cursor-pointer border-b border-border last:border-0 bg-surface text-[13px] hover:bg-surface-sunken"
                >
                  <td className="px-3 py-2.5 text-foreground">{task.title}</td>
                  {visibleFields.priority && (
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>
                  )}
                  {visibleFields.members && (
                    <td className="hidden px-3 py-2.5 md:table-cell">
                      <AvatarStack users={task.assignee ? [task.assignee, ...task.members] : task.members} size="xs" />
                    </td>
                  )}
                  {visibleFields.dueDate && (
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <DueDateBadge date={task.dueDate} />
                    </td>
                  )}
                  {visibleFields.labels && (
                    <td className="hidden px-3 py-2.5 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {task.labels.slice(0, 2).map((l) => (
                          <LabelPill key={l.id} name={l.name} />
                        ))}
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <TaskActionsMenu task={task}>
                      <button className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </TaskActionsMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => setAddTaskDialogOpen(true, status)}
            className="flex w-full items-center gap-1.5 border-t border-border bg-surface px-3 py-2 text-left text-[13px] text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
