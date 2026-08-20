"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [title, setTitle] = useState(user?.title ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const dirty = fullName !== user.fullName || title !== (user.title ?? "") || username !== (user.username ?? "");

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.patch("/users/me", {
        fullName: fullName.trim() || user.fullName,
        title: title.trim() || null,
        username: username.trim() || null,
      });
      updateUser(updated as Partial<typeof user>);
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't update profile");
    } finally {
      setSaving(false);
    }
  };

  const leaveWorkspace = async () => {
    if (!confirm("Remove yourself from the workspace? This will delete your account and owned data.")) return;
    await api.delete("/users/me");
    logout();
  };

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8 sm:px-10">
      <h1 className="text-lg font-semibold text-foreground">Profile</h1>

      <div className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border">
        <FieldRow label="Profile picture">
          <UserAvatar user={user} size="lg" />
        </FieldRow>

        <FieldRow label="Email">
          <span className="text-[13px] text-muted-foreground">{user.email ?? "Not set (guest account)"}</span>
        </FieldRow>

        <FieldRow label="Full name">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="max-w-[240px]" />
        </FieldRow>

        <FieldRow label="Title" hint="Your job title or role">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Designer" className="max-w-[240px]" />
        </FieldRow>

        <FieldRow label="Username" hint="One word, like a nickname or first name">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="dexuser" className="max-w-[240px]" />
        </FieldRow>
      </div>

      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <h2 className="mt-10 text-[13px] font-semibold text-foreground">Workspace access</h2>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-border p-4">
        <p className="text-[13px] text-muted-foreground">Remove yourself from the workspace</p>
        <Button variant="danger" size="sm" onClick={leaveWorkspace}>
          Leave Workspace
        </Button>
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
