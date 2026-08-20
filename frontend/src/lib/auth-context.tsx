"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken, setToken, API_URL } from "./api";
import type { ColorMode, Theme, User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time session check against whatever token localStorage has on
    // mount; there's no external-state subscription to model here, just an
    // initial fetch, so the setState-in-effect lint rule doesn't apply.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const loginAsGuest = useCallback(async () => {
    const { accessToken, user: newUser } = await api.post<{ accessToken: string; user: User }>(
      "/auth/guest"
    );
    setToken(accessToken);
    setUser(newUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Probe first (without following the redirect) so an unconfigured
    // server surfaces as a toast instead of a raw JSON 501 page — the real
    // navigation only happens once we know Google would actually redirect.
    const probeUrl = `${API_URL}/api/auth/google`;
    const res = await fetch(probeUrl, { redirect: "manual" });
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = probeUrl;
      return;
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Google login is not available right now.");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginAsGuest, loginWithGoogle, logout, refresh, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function themeAndAccentFromUser(user: User | null): { theme: Theme; colorMode: ColorMode } {
  return {
    theme: user?.theme ?? "light",
    colorMode: user?.colorMode ?? "blue",
  };
}
