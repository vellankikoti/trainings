"use client";

import { useState } from "react";

interface ProfileFormProps {
  initialData: {
    display_name: string | null;
    username: string | null;
    bio: string | null;
    github_username: string | null;
    public_profile: boolean;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || "",
    username: initialData.username || "",
    bio: initialData.bio || "",
    github_username: initialData.github_username || "",
    public_profile: initialData.public_profile,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Display Name</label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, display_name: e.target.value }))
          }
          className="w-full rounded-lg border bg-background px-3 py-2"
          placeholder="Your display name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            }))
          }
          className="w-full rounded-lg border bg-background px-3 py-2"
          placeholder="your-username"
          pattern="[a-z0-9-]+"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bio: e.target.value }))
          }
          className="w-full rounded-lg border bg-background px-3 py-2"
          rows={3}
          placeholder="Tell us about yourself"
          maxLength={500}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">GitHub Username</label>
        <input
          type="text"
          value={formData.github_username}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, github_username: e.target.value }))
          }
          className="w-full rounded-lg border bg-background px-3 py-2"
          placeholder="your-github-username"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="public_profile"
          checked={formData.public_profile}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, public_profile: e.target.checked }))
          }
          className="h-4 w-4 rounded border"
        />
        <label htmlFor="public_profile" className="text-sm">
          Make my profile public
        </label>
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

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
