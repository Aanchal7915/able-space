"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Loader2, Palette, Search, Sun, User } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/theme", label: "Theme", icon: Sun },
  { href: "/settings/color", label: "Color", icon: Palette },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth();
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-sidebar sm:flex">
        <div className="p-3">
          <Link
            href="/tasks"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to app
          </Link>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-muted-foreground">
            <Search className="size-3.5" />
            <span className="text-[13px]">Search</span>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                  active ? "bg-accent-soft text-accent-soft-foreground" : "text-muted hover:bg-surface-sunken hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4 sm:hidden">
          <Link href="/tasks" className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <ArrowLeft className="size-3.5" />
            Back to app
          </Link>
        </div>
        <div className="flex gap-1 border-b border-border px-4 py-2 sm:hidden">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium",
                  active ? "bg-accent-soft text-accent-soft-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
