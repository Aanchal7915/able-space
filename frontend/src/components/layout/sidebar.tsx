"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  Kanban,
  FolderKanban,
  Moon,
  Sun,
  Palette,
  Settings,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAccent } from "@/lib/accent-provider";
import { useUIStore } from "@/lib/ui-store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { COLOR_MODES, type ColorMode, type Theme } from "@/lib/types";
import { UserAvatar } from "@/components/ui/avatar";
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

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks", icon: Kanban },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, updateUser } = useAuth();
  const { setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const { mobileSidebarOpen, setMobileSidebarOpen, sidebarCollapsed } = useUIStore();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  if (!user) return null;

  const applyTheme = async (theme: Theme) => {
    setTheme(theme);
    updateUser({ theme });
    try {
      await api.patch("/users/me/preferences", { theme });
    } catch {
      // best-effort sync; local preference already applied
    }
  };

  const applyAccent = async (colorMode: ColorMode) => {
    setAccent(colorMode);
    updateUser({ colorMode });
    try {
      await api.patch("/users/me/preferences", { colorMode });
    } catch {
      // best-effort sync
    }
  };

  const content = (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between px-3 pt-3 pb-1 md:hidden">
        <span className="text-sm font-semibold">Menu</span>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="rounded-md p-1.5 hover:bg-surface-sunken"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-2">
        <AccountMenu
          fullName={user.fullName}
          title={user.title}
          email={user.email}
          userId={user.id}
          avatarUrl={user.avatarUrl}
          avatarColor={user.avatarColor}
          onTheme={applyTheme}
          onAccent={applyAccent}
          currentAccent={accent}
          collapsed={sidebarCollapsed}
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        <button
          onClick={() => setWorkspaceOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground",
            sidebarCollapsed && "justify-center"
          )}
        >
          <ChevronDown className={cn("size-3 transition-transform", !workspaceOpen && "-rotate-90")} />
          {!sidebarCollapsed && "Workspace"}
        </button>

        {workspaceOpen && (
          <nav className="mt-0.5 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-accent-soft text-accent-soft-foreground"
                      : "text-muted hover:bg-surface-sunken hover:text-foreground",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        aria-label="Primary navigation"
        className={cn(
          "hidden md:flex shrink-0 border-r border-border transition-[width] duration-150",
          sidebarCollapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        {content}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-overlay animate-fade-in" onClick={() => setMobileSidebarOpen(false)} />
          <aside
            aria-label="Mobile navigation"
            className="absolute left-0 top-0 h-full w-[260px] border-r border-border animate-slide-in-right shadow-2xl"
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function AccountMenu({
  fullName,
  title,
  email,
  userId,
  avatarUrl,
  avatarColor,
  onTheme,
  onAccent,
  currentAccent,
  collapsed,
}: {
  fullName: string;
  title: string | null;
  email: string | null;
  userId: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  onTheme: (t: Theme) => void;
  onAccent: (c: ColorMode) => void;
  currentAccent: ColorMode;
  collapsed: boolean;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-surface-sunken",
            collapsed && "justify-center"
          )}
        >
          <UserAvatar user={{ id: userId, fullName, avatarUrl, avatarColor }} size="md" />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{fullName}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{title || email || "Guest"}</p>
              </div>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onTheme("light")}>
              <Sun className="size-3.5" /> Light
              {theme === "light" && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTheme("dark")}>
              <Moon className="size-3.5" /> Dark
              {theme === "dark" && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="size-3.5" />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {COLOR_MODES.map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => onAccent(c.id)}>
                <span className="size-3 rounded-full border border-border" style={{ backgroundColor: c.swatch }} />
                {c.label}
                {currentAccent === c.id && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <Settings className="size-3.5" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-danger">
          <LogOut className="size-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
