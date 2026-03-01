"use client";

import { useState } from "react";

interface PreferencesFormProps {
  initialData: {
    theme: string;
    email_notifications: boolean;
  };
}

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const [formData, setFormData] = useState({
    theme: initialData.theme,
    email_notifications: initialData.email_notifications,
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

      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Preferences saved!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Theme</label>
        <select
          value={formData.theme}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, theme: e.target.value }))
          }
          className="w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="email_notifications"
          checked={formData.email_notifications}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email_notifications: e.target.checked,
            }))
          }
          className="h-4 w-4 rounded border"
        />
        <label htmlFor="email_notifications" className="text-sm">
          Email notifications for progress updates and achievements
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
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
