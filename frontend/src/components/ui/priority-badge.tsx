import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";
import { PRIORITY_META } from "@/lib/types";

const COLOR: Record<Priority, string> = {
  no_priority: "text-muted-foreground",
  urgent: "text-danger",
  high: "text-danger",
  medium: "text-amber-500",
  low: "text-muted-foreground",
};

const BAR_COLOR: Record<Priority, string> = {
  no_priority: "bg-border-strong",
  urgent: "bg-danger",
  high: "bg-danger",
  medium: "bg-amber-500",
  low: "bg-muted-foreground",
};

export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  const active = PRIORITY_META[priority].barsActive;
  const heights = [4, 7, 10, 13];
  return (
    <span className={cn("inline-flex items-end gap-[1.5px] h-[13px]", className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: h }}
          className={cn(
            "w-[3px] rounded-[1px]",
            i < active ? BAR_COLOR[priority] : "bg-border-strong"
          )}
        />
      ))}
    </span>
  );
}

export function PriorityBadge({ priority, showLabel = true }: { priority: Priority; showLabel?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", COLOR[priority])}>
      <PriorityIcon priority={priority} />
      {showLabel && <span>{PRIORITY_META[priority].label}</span>}
    </span>
  );
}
