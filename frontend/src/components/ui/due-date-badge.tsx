import { Calendar } from "lucide-react";
import { cn, formatDate, isOverdue } from "@/lib/utils";

export function DueDateBadge({ date, className }: { date: string | null; className?: string }) {
  if (!date) return <span className={cn("text-[13px] text-muted-foreground", className)}>—</span>;
  const overdue = isOverdue(date);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[13px] rounded px-1.5 py-0.5",
        overdue ? "text-danger bg-danger/10" : "text-muted-foreground",
        className
      )}
    >
      <Calendar className="size-3" />
      {formatDate(date)}
    </span>
  );
}
