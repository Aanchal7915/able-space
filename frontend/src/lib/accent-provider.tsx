"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ColorMode } from "./types";

const STORAGE_KEY = "ablespace-accent";

interface AccentContextValue {
  accent: ColorMode;
  setAccent: (accent: ColorMode) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<ColorMode>("blue");

  useEffect(() => {
    // Reading localStorage is only possible client-side post-mount (it isn't
    // available during SSR), so this initial sync has to happen in an effect.
    const stored = window.localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setAccentState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  const setAccent = (next: ColorMode) => {
    setAccentState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ accent, setAccent }), [accent]);

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}

export const ACCENT_STORAGE_KEY = STORAGE_KEY;
export const THEME_STORAGE_KEY = "ablespace-theme";
