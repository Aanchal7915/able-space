"use client";

import { Check } from "lucide-react";
import { useAccent } from "@/lib/accent-provider";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { COLOR_MODES, type ColorMode } from "@/lib/types";

export default function ColorSettingsPage() {
  const { accent, setAccent } = useAccent();
  const { updateUser } = useAuth();

  const choose = async (c: ColorMode) => {
    setAccent(c);
    updateUser({ colorMode: c });
    try {
      await api.patch("/users/me/preferences", { colorMode: c });
    } catch {
      // best-effort sync
    }
  };

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 sm:px-10">
      <h1 className="text-lg font-semibold text-foreground">Color</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Pick an accent color used across buttons, links and highlights.</p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {COLOR_MODES.map((c) => {
          const active = accent === c.id;
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                active ? "border-accent" : "border-border hover:border-border-strong"
              )}
            >
              <span
                className="relative flex size-10 items-center justify-center rounded-full"
                style={{ backgroundColor: c.swatch }}
              >
                {active && <Check className="size-4 text-white" />}
              </span>
              <span className="text-[12.5px] font-medium text-foreground">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
