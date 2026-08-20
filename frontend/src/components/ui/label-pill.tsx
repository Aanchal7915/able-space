import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function LabelPill({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-surface-sunken border border-border px-1.5 py-0.5 text-[11px] text-muted leading-none whitespace-nowrap",
        className
      )}
    >
      <Tag className="size-2.5" />
      {name}
    </span>
  );
}

export function StatusDot({ className }: { className?: string }) {
  return <span className={cn("size-2 rounded-full bg-accent", className)} />;
}
