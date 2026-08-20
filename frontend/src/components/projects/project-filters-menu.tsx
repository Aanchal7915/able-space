"use client";

import { Filter } from "lucide-react";
import { PRIORITY_META, type Priority } from "@/lib/types";
import { PriorityIcon } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectFiltersMenu({
  priorities,
  onChange,
}: {
  priorities: Priority[];
  onChange: (priorities: Priority[]) => void;
}) {
  const togglePriority = (p: Priority) => {
    onChange(priorities.includes(p) ? priorities.filter((x) => x !== p) : [...priorities, p]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(priorities.length > 0 && "border-accent text-accent")}>
          <Filter className="size-3.5" />
          Filter
          {priorities.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
              {priorities.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* Flat list, not a nested Sub/SubContent: this menu sits near the
          right edge of the toolbar, and Radix's submenu hover-tracking
          breaks when a Sub is forced to flip open on its left side near a
          viewport edge (verified: hovering into a flipped-left submenu
          closes it before a click can land). A single-level list sidesteps
          that failure mode entirely instead of fighting the collision math. */}
      <DropdownMenuContent align="end" className="w-[190px]">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
          <DropdownMenuCheckboxItem key={p} checked={priorities.includes(p)} onCheckedChange={() => togglePriority(p)}>
            <PriorityIcon priority={p} />
            {PRIORITY_META[p].label}
          </DropdownMenuCheckboxItem>
        ))}
        {priorities.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>Clear filters</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
