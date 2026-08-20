"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/lib/types";
import { UserAvatar } from "@/components/ui/avatar";
import { DueDateBadge } from "@/components/ui/due-date-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { api } from "@/lib/api";
import { useUIStore } from "@/lib/ui-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectsTable({ projects, mutate }: { projects: Project[]; mutate: () => void }) {
  const router = useRouter();
  const visibleFields = useUIStore((s) => s.visibleProjectFields);

  const remove = async (id: string) => {
    await api.delete(`/projects/${id}`);
    mutate();
    toast.success("Project deleted");
  };

  return (
    <div className="mx-4 mt-3 overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-sunken text-[12px] text-muted-foreground">
            <th className="px-3 py-2 font-medium">Projects</th>
            {visibleFields.priority && <th className="hidden px-3 py-2 font-medium sm:table-cell">Priority</th>}
            {visibleFields.lead && <th className="hidden px-3 py-2 font-medium md:table-cell">Lead</th>}
            {visibleFields.dueDate && <th className="hidden px-3 py-2 font-medium sm:table-cell">Due Date</th>}
            {visibleFields.taskCount && <th className="hidden px-3 py-2 font-medium md:table-cell">Tasks</th>}
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              onClick={() => router.push(`/projects/${p.id}`)}
              className="cursor-pointer border-b border-border last:border-0 bg-surface text-[13px] hover:bg-surface-sunken"
            >
              <td className="px-3 py-2.5 font-medium text-accent">{p.name}</td>
              {visibleFields.priority && (
                <td className="hidden px-3 py-2.5 sm:table-cell">
                  <PriorityBadge priority={p.priority} />
                </td>
              )}
              {visibleFields.lead && (
                <td className="hidden px-3 py-2.5 md:table-cell">
                  {p.lead ? <UserAvatar user={p.lead} size="xs" /> : <span className="text-muted-foreground">—</span>}
                </td>
              )}
              {visibleFields.dueDate && (
                <td className="hidden px-3 py-2.5 sm:table-cell">
                  <DueDateBadge date={p.dueDate} />
                </td>
              )}
              {visibleFields.taskCount && (
                <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">{p.taskCount ?? 0}</td>
              )}
              <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                      aria-label={`Actions for ${p.name}`}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => remove(p.id)} className="text-danger">
                      <Trash2 className="size-3.5" />
                      Delete project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                No projects match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
