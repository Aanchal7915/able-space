"use client";

import { Filter } from "lucide-react";
import { useLabels } from "@/hooks/use-data";
import { PRIORITY_META, type Priority } from "@/lib/types";
import { PriorityIcon } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface TaskFilters {
  priorities: Priority[];
  labelIds: string[];
}

export const EMPTY_TASK_FILTERS: TaskFilters = { priorities: [], labelIds: [] };

export function TaskFiltersMenu({
  filters,
  onChange,
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}) {
  const { labels } = useLabels();
  const activeCount = filters.priorities.length + filters.labelIds.length;

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((x) => x !== p)
      : [...filters.priorities, p];
    onChange({ ...filters, priorities: next });
  };

  const toggleLabel = (id: string) => {
    const next = filters.labelIds.includes(id)
      ? filters.labelIds.filter((x) => x !== id)
      : [...filters.labelIds, id];
    onChange({ ...filters, labelIds: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(activeCount > 0 && "border-accent text-accent")}>
          <Filter className="size-3.5" />
          Filter
          {activeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* Flat list, not nested Sub/SubContent menus: this toolbar sits near
          the right edge of the viewport, and Radix's submenu hover-tracking
          reliably breaks when a Sub is forced to flip open on its left side
          near a viewport edge — hovering into the flipped submenu closes it
          before a click can land. A single-level list (grouped by label,
          scrollable) sidesteps that failure mode entirely. */}
      <DropdownMenuContent align="end" className="w-[200px] max-h-[360px] overflow-y-auto scrollbar-thin">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
          <DropdownMenuCheckboxItem
            key={p}
            checked={filters.priorities.includes(p)}
            onCheckedChange={() => togglePriority(p)}
          >
            <PriorityIcon priority={p} />
            {PRIORITY_META[p].label}
          </DropdownMenuCheckboxItem>
        ))}

        {labels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Labels</DropdownMenuLabel>
            {labels.map((l) => (
              <DropdownMenuCheckboxItem
                key={l.id}
                checked={filters.labelIds.includes(l.id)}
                onCheckedChange={() => toggleLabel(l.id)}
              >
                {l.name}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(EMPTY_TASK_FILTERS)}>Clear filters</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function applyTaskFilters<T extends { priority: Priority; labels: { id: string }[] }>(
  tasks: T[],
  filters: TaskFilters
): T[] {
  return tasks.filter((t) => {
    if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) return false;
    if (filters.labelIds.length > 0 && !t.labels.some((l) => filters.labelIds.includes(l.id))) return false;
    return true;
  });
}
