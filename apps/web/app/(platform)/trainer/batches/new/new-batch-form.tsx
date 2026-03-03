"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewBatchFormProps {
  instituteId: string;
  pathOptions: { slug: string; title: string }[];
}

export function NewBatchForm({ instituteId, pathOptions }: NewBatchFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePath = (slug: string) => {
    setSelectedPaths((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaths.length === 0) {
      setError("Select at least one learning path.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/institutes/${instituteId}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          assigned_path_slugs: selectedPaths,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create batch");
      }

      const data = await res.json();
      router.push(`/trainer/batches/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create batch");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Batch Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="e.g., January 2026 Cohort"
          required
          minLength={2}
          maxLength={200}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          rows={3}
          placeholder="Brief description of this batch..."
          maxLength={1000}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Assign Learning Paths
        </label>
        <div className="space-y-2">
          {pathOptions.map((p) => (
            <label
              key={p.slug}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                selectedPaths.includes(p.slug)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPaths.includes(p.slug)}
                onChange={() => togglePath(p.slug)}
                className="h-4 w-4 rounded border"
              />
              <span className="text-sm font-medium">{p.title}</span>
              <span className="text-xs text-muted-foreground">{p.slug}</span>
            </label>
          ))}
        </div>
        {pathOptions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No learning paths found in the content directory.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Start Date (optional)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            End Date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Batch"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
