"use client";

import { LayoutGrid, List } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const { viewMode, setViewMode } = useUIStore();
  return (
    <div className="flex items-center rounded-md border border-border bg-surface p-0.5">
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors",
          viewMode === "list" ? "bg-surface-sunken text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        title="List view"
      >
        <List className="size-3.5" />
      </button>
      <button
        onClick={() => setViewMode("board")}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors",
          viewMode === "board" ? "bg-surface-sunken text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        title="Board view"
      >
        <LayoutGrid className="size-3.5" />
      </button>
    </div>
  );
}
