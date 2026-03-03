"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobPostFormProps {
  orgId: string;
}

export function JobPostForm({ orgId }: JobPostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    company_name: "",
    description: "",
    location_city: "",
    location_country: "",
    is_remote: false,
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    required_skills: "",
    experience_years_min: "",
    experience_years_max: "",
    employment_type: "full_time",
    expires_at: "",
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const skills = form.required_skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/organizations/${orgId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          company_name: form.company_name,
          description: form.description || undefined,
          location_city: form.location_city || undefined,
          location_country: form.location_country || undefined,
          is_remote: form.is_remote,
          salary_min: form.salary_min ? Number(form.salary_min) : undefined,
          salary_max: form.salary_max ? Number(form.salary_max) : undefined,
          salary_currency: form.salary_currency,
          required_skills: skills.length > 0 ? skills : undefined,
          experience_years_min: form.experience_years_min
            ? Number(form.experience_years_min)
            : undefined,
          experience_years_max: form.experience_years_max
            ? Number(form.experience_years_max)
            : undefined,
          employment_type: form.employment_type,
          expires_at: form.expires_at || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      router.push("/organization");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Job Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="e.g., Senior DevOps Engineer"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Company Name</label>
        <input
          type="text"
          value={form.company_name}
          onChange={(e) => set("company_name", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          rows={5}
          placeholder="Job responsibilities, requirements..."
          maxLength={5000}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input
            type="text"
            value={form.location_city}
            onChange={(e) => set("location_city", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="e.g., San Francisco"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input
            type="text"
            value={form.location_country}
            onChange={(e) => set("location_country", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="e.g., USA"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_remote"
          checked={form.is_remote}
          onChange={(e) => set("is_remote", e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor="is_remote" className="text-sm font-medium">
          Remote position
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Min Salary</label>
          <input
            type="number"
            value={form.salary_min}
            onChange={(e) => set("salary_min", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="60000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max Salary</label>
          <input
            type="number"
            value={form.salary_max}
            onChange={(e) => set("salary_max", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="120000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Currency</label>
          <select
            value={form.salary_currency}
            onChange={(e) => set("salary_currency", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Required Skills
        </label>
        <input
          type="text"
          value={form.required_skills}
          onChange={(e) => set("required_skills", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
          placeholder="linux, docker, kubernetes, ci-cd"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Comma-separated list of skills
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Min Years</label>
          <input
            type="number"
            value={form.experience_years_min}
            onChange={(e) => set("experience_years_min", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="2"
            min={0}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max Years</label>
          <input
            type="number"
            value={form.experience_years_max}
            onChange={(e) => set("experience_years_max", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="8"
            min={0}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            value={form.employment_type}
            onChange={(e) => set("employment_type", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Expires On (optional)
        </label>
        <input
          type="date"
          value={form.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.company_name.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Posting..." : "Post Job"}
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
