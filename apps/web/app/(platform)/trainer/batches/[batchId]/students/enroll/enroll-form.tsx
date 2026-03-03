"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EnrollFormProps {
  batchId: string;
  instituteId: string;
}

interface EnrollResult {
  enrolled: string[];
  skipped: string[];
  notFound: string[];
}

export function EnrollForm({ batchId, instituteId }: EnrollFormProps) {
  const router = useRouter();
  const [usernames, setUsernames] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnrollResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = usernames
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      setError("Enter at least one username.");
      return;
    }

    setSaving(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/institutes/${instituteId}/batches/${batchId}/enrollments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: parsed }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll students");
      }

      const data = await res.json();
      setResult(data);
      setUsernames("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll students",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Usernames</label>
          <textarea
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
            rows={6}
            placeholder={"student1\nstudent2\nstudent3"}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter usernames separated by new lines or commas. Students must have
            an account on the platform.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !usernames.trim()}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Enrolling..." : "Enroll Students"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">Enrollment Results</h3>

          {result.enrolled.length > 0 && (
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Enrolled ({result.enrolled.length})
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                {result.enrolled.join(", ")}
              </p>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div className="rounded-lg bg-amber-500/10 p-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Already enrolled ({result.skipped.length})
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                {result.skipped.join(", ")}
              </p>
            </div>
          )}

          {result.notFound.length > 0 && (
            <div className="rounded-lg bg-red-500/10 p-3">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Not found ({result.notFound.length})
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                {result.notFound.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
