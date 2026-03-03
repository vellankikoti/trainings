"use client";

import { useState } from "react";

interface PreferencesFormProps {
  initialData: {
    theme: string;
    email_notifications: boolean;
  };
}

const NOTIFICATION_CATEGORIES = [
  {
    label: "Achievements",
    description: "Badge earned, level up, path completion",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    label: "Streak Alerts",
    description: "Streak at risk, streak milestones, freeze usage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    label: "Progress Updates",
    description: "Weekly summary, course completion, milestone reminders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
      </svg>
    ),
  },
  {
    label: "System",
    description: "Platform updates, maintenance, new features",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    ),
  },
];

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

      {/* ── Email Notifications ── */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Email Notifications</label>
          <button
            type="button"
            role="switch"
            aria-checked={formData.email_notifications}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                email_notifications: !prev.email_notifications,
              }))
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              formData.email_notifications ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                formData.email_notifications ? "translate-x-5" : "translate-x-0.5"
              } mt-0.5`}
            />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Receive email notifications for important updates
        </p>

        {formData.email_notifications && (
          <div className="mt-4 space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              You will receive emails for
            </p>
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <div key={cat.label} className="flex items-start gap-3">
                <span className="mt-0.5 text-muted-foreground">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
