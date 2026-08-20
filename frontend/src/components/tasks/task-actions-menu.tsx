"use client";

import { Trash2, ArrowRightCircle } from "lucide-react";
import type { Task } from "@/lib/types";
import { STATUS_COLUMNS } from "@/lib/types";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mutate } from "swr";
import { toast } from "sonner";

export function TaskActionsMenu({ task, children }: { task: Task; children: React.ReactNode }) {
  const moveTo = async (status: string) => {
    await api.patch(`/tasks/${task.id}`, { status });
    mutate((key) => typeof key === "string" && key.startsWith("/tasks"));
  };

  const remove = async () => {
    await api.delete(`/tasks/${task.id}`);
    mutate((key) => typeof key === "string" && key.startsWith("/tasks"));
    toast.success("Task deleted");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[190px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightCircle className="size-3.5" />
            Move to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_COLUMNS.filter((c) => c.id !== task.status).map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => moveTo(c.id)}>
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={remove} className="text-danger">
          <Trash2 className="size-3.5" />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
