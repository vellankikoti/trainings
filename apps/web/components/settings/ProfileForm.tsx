"use client";

import { useState } from "react";

interface ProfileFormProps {
  initialData: {
    display_name: string | null;
    username: string | null;
    bio: string | null;
    github_username: string | null;
    public_profile: boolean;
    is_discoverable: boolean;
    availability: string;
    location_city: string | null;
    location_country: string | null;
    profile_visibility: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || "",
    username: initialData.username || "",
    bio: initialData.bio || "",
    github_username: initialData.github_username || "",
    public_profile: initialData.public_profile,
    is_discoverable: initialData.is_discoverable,
    availability: initialData.availability || "not_specified",
    location_city: initialData.location_city || "",
    location_country: initialData.location_country || "",
    profile_visibility: initialData.profile_visibility || "full",
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic Info ── */}
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              type="text"
              value={formData.location_city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location_city: e.target.value }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
              placeholder="e.g., Bangalore"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <input
              type="text"
              value={formData.location_country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location_country: e.target.value }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
              placeholder="e.g., India"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Availability</label>
          <select
            value={formData.availability}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, availability: e.target.value }))
            }
            className="w-full rounded-lg border bg-background px-3 py-2"
          >
            <option value="not_specified">Prefer not to say</option>
            <option value="open">Open to opportunities</option>
            <option value="looking">Actively looking</option>
            <option value="not_looking">Not looking</option>
          </select>
        </div>
      </div>

      {/* ── Privacy Controls ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Privacy
        </h3>
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="public_profile"
              checked={formData.public_profile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, public_profile: e.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border"
            />
            <div>
              <label htmlFor="public_profile" className="text-sm font-medium">
                Public profile
              </label>
              <p className="text-xs text-muted-foreground">
                Allow others to view your profile at /u/{formData.username || "username"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="is_discoverable"
              checked={formData.is_discoverable}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_discoverable: e.target.checked }))
              }
              className="mt-1 h-4 w-4 rounded border"
            />
            <div>
              <label htmlFor="is_discoverable" className="text-sm font-medium">
                Discoverable
              </label>
              <p className="text-xs text-muted-foreground">
                Show your location, availability, and include you in talent search results
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Profile visibility
            </label>
            <select
              value={formData.profile_visibility}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, profile_visibility: e.target.value }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="full">Full — show skills, badges, and activity</option>
              <option value="limited">Limited — show skills and badges only</option>
              <option value="minimal">Minimal — show basic info only</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Controls what visitors see on your public profile
            </p>
          </div>
        </div>
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
