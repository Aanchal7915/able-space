"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l3.99-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, loginAsGuest, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"guest" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/tasks");
  }, [loading, user, router]);

  const handleGuest = async () => {
    setSubmitting("guest");
    setError(null);
    try {
      await loginAsGuest();
      router.replace("/tasks");
    } catch {
      setError("Couldn't start a guest session. Please try again.");
      setSubmitting(null);
    }
  };

  const handleGoogle = async () => {
    setSubmitting("google");
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in with Google.");
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-sunken px-4">
      <div className="mb-8 flex items-center gap-2 text-foreground">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Layers className="size-4.5" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">AbleSpace</span>
      </div>

      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Let&apos;s get back on track</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Enter your email below to login to your account.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGuest}
            disabled={submitting !== null}
          >
            {submitting === "guest" ? "Signing in…" : "Continue as Guest"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
            disabled={submitting !== null}
          >
            <GoogleIcon />
            {submitting === "google" ? "Redirecting…" : "Login with Google"}
          </Button>
        </div>

        {error && <p className="mt-3 text-center text-[13px] text-danger">{error}</p>}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
