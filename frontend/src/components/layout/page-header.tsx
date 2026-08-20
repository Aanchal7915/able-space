"use client";

import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { setMobileSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-md p-1.5 hover:bg-surface-sunken md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-4.5" />
        </button>
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-foreground md:flex"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
        <div className={cn("min-w-0 flex items-baseline gap-1.5")}>
          {breadcrumb}
          <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}
