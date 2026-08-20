"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/types";

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { updateUser } = useAuth();

  const choose = async (t: Theme) => {
    setTheme(t);
    updateUser({ theme: t });
    try {
      await api.patch("/users/me/preferences", { theme: t });
    } catch {
      // best-effort sync
    }
  };

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 sm:px-10">
      <h1 className="text-lg font-semibold text-foreground">Theme</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Choose how AbleSpace looks on this device. Your preference is saved to your account.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-colors",
                active ? "border-accent" : "border-border hover:border-border-strong"
              )}
            >
              {active && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <div
                className={cn(
                  "flex h-28 w-full items-center justify-center rounded-lg border",
                  opt.id === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                )}
              >
                <Icon className={cn("size-8", opt.id === "dark" ? "text-zinc-100" : "text-zinc-800")} />
              </div>
              <span className="text-[13px] font-medium text-foreground">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
