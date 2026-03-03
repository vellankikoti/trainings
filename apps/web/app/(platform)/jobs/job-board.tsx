"use client";

import { useState, useEffect } from "react";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location_city: string | null;
  location_country: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  required_skills: string[];
  experience_years_min: number | null;
  experience_years_max: number | null;
  employment_type: string | null;
  posted_at: string;
  description: string | null;
}

export function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (remoteOnly) params.set("remote", "true");

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [remoteOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const applyToJob = async (jobId: string) => {
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      if (res.ok) {
        setApplied((prev) => new Set([...prev, jobId]));
      }
    } catch {
      // ignore
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;
    const fmt = (n: number) =>
      n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (job.salary_min && job.salary_max) {
      return `${job.salary_currency} ${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
    }
    if (job.salary_min) return `${job.salary_currency} ${fmt(job.salary_min)}+`;
    return `Up to ${job.salary_currency} ${fmt(job.salary_max!)}`;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="Search jobs by title, company, or description..."
        />
        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          Remote
        </label>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        {loading ? "Loading..." : `${total} job(s) found`}
      </p>

      {/* Job List */}
      <div className="space-y-3">
        {jobs.map((job) => {
          const salary = formatSalary(job);
          return (
            <div
              key={job.id}
              className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                selectedJob?.id === job.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.company_name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.is_remote && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Remote
                      </span>
                    )}
                    {job.location_city && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {job.location_city}
                        {job.location_country && `, ${job.location_country}`}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {job.employment_type.replace("_", "-")}
                      </span>
                    )}
                    {salary && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {salary}
                      </span>
                    )}
                  </div>
                  {job.required_skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.required_skills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.posted_at).toLocaleDateString()}
                  </p>
                  {applied.has(job.id) ? (
                    <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyToJob(job.id);
                      }}
                      disabled={applying}
                      className="mt-2 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Detail Panel */}
      {selectedJob && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-bold">{selectedJob.title}</h2>
          <p className="mt-1 text-muted-foreground">
            {selectedJob.company_name}
          </p>
          {selectedJob.description && (
            <div className="mt-4 whitespace-pre-wrap text-sm">
              {selectedJob.description}
            </div>
          )}
          {selectedJob.experience_years_min != null && (
            <p className="mt-4 text-sm text-muted-foreground">
              Experience: {selectedJob.experience_years_min}
              {selectedJob.experience_years_max != null &&
                ` - ${selectedJob.experience_years_max}`}{" "}
              years
            </p>
          )}
        </div>
      )}
    </div>
  );
}
