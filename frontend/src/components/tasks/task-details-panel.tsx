"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { PRIORITY_META, STATUS_COLUMNS } from "@/lib/types";
import { useUsers } from "@/hooks/use-data";
import { PriorityIcon } from "@/components/ui/priority-badge";
import { AvatarStack, UserAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  doing: "Doing",
  completed: "Completed",
  on_hold: "On Hold",
};

export function TaskDetailsPanel({
  task,
  onUpdate,
}: {
  task: Task;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const { users } = useUsers();

  return (
    <div className="w-full shrink-0 lg:w-[260px]">
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-[12.5px] font-medium text-foreground">Details</span>
        </div>

        <div className="flex flex-col divide-y divide-border">
          <Row label="Status">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-[13px] font-medium text-foreground hover:opacity-70">
                {STATUS_LABEL[task.status]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUS_COLUMNS.map((c) => (
                  <DropdownMenuItem key={c.id} onClick={() => onUpdate({ status: c.id })}>
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>

          <Row label="Priority">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:opacity-70">
                <PriorityIcon priority={task.priority} />
                {PRIORITY_META[task.priority].label}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                  <DropdownMenuItem key={p} onClick={() => onUpdate({ priority: p })}>
                    <PriorityIcon priority={p} />
                    {PRIORITY_META[p].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>

          <Row label="Assignee">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:opacity-70">
                {task.assignee ? (
                  <>
                    <UserAvatar user={task.assignee} size="xs" />
                    {task.assignee.fullName}
                  </>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate({ assigneeId: null })}>Unassigned</DropdownMenuItem>
                {users.map((u) => (
                  <DropdownMenuItem key={u.id} onClick={() => onUpdate({ assigneeId: u.id })}>
                    <UserAvatar user={u} size="xs" />
                    {u.fullName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>

          <Row label="Members">
            <MembersEditor task={task} onUpdate={onUpdate} />
          </Row>

          <Row label="Due Date">
            <label className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-foreground hover:opacity-70">
              <Calendar className="size-3.5 text-muted-foreground" />
              {task.dueDate ? formatDate(task.dueDate) : <span className="text-muted-foreground">Set date</span>}
              <input
                type="date"
                className="sr-only"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                onChange={(e) => onUpdate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </label>
          </Row>

          <Row label="Reporter">
            {task.reporter ? (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <UserAvatar user={task.reporter} size="xs" />
                {task.reporter.fullName}
              </span>
            ) : (
              <span className="text-[13px] text-muted-foreground">—</span>
            )}
          </Row>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border p-3">
        <p className="text-[12.5px] font-medium text-foreground">Updates</p>
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          Created {formatDate(task.createdAt)}
          {task.reporter ? ` by ${task.reporter.fullName}` : ""}.
        </p>
        {task.updatedAt !== task.createdAt && (
          <p className="mt-1 text-[12.5px] text-muted-foreground">Last updated {formatDate(task.updatedAt)}.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function MembersEditor({ task, onUpdate }: { task: Task; onUpdate: (patch: Record<string, unknown>) => void }) {
  const { users } = useUsers();
  const memberIds = task.members.map((m) => m.id);

  const toggle = (id: string) => {
    const next = memberIds.includes(id) ? memberIds.filter((m) => m !== id) : [...memberIds, id];
    onUpdate({ memberIds: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AvatarStack users={task.members} size="xs" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {users.map((u) => (
          <DropdownMenuItem key={u.id} onClick={() => toggle(u.id)}>
            <UserAvatar user={u} size="xs" />
            {u.fullName}
            {memberIds.includes(u.id) && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
