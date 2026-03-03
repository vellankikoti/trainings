"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface InviteMemberFormProps {
  instituteId: string;
}

export function InviteMemberForm({ instituteId }: InviteMemberFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"trainer" | "institute_admin">("trainer");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/institutes/${instituteId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add member");
      }

      setMessage({ type: "success", text: `${username} added as ${role}` });
      setUsername("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add member",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Enter their platform username"
          required
          minLength={1}
          maxLength={100}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          The user must already have an account on the platform.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Role</label>
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "trainer" | "institute_admin")
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        >
          <option value="trainer">Trainer</option>
          <option value="institute_admin">Institute Admin</option>
        </select>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !username.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Member"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/institute")}
          className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back
        </button>
      </div>
    </form>
  );
}
