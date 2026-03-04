"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  external_url: string | null;
  source: string;
}

export function PublicJobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchJobs = async (pageNum = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (remoteOnly) params.set("remote", "true");
    params.set("page", String(pageNum));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const totalPages = Math.ceil(total / limit);

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;
    const fmt = (n: number) =>
      n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (job.salary_min && job.salary_max) {
      return `${job.salary_currency} ${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
    }
    if (job.salary_min)
      return `${job.salary_currency} ${fmt(job.salary_min)}+`;
    return `Up to ${job.salary_currency} ${fmt(job.salary_max!)}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search jobs by title, company, or description..."
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted/50">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 rounded border accent-primary"
          />
          Remote only
        </label>
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {loading ? "Searching..." : `${total} job${total !== 1 ? "s" : ""} found`}
      </p>

      {/* Job List + Detail Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Job Cards */}
        <div className="space-y-3 lg:col-span-2">
          {loading && jobs.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-border p-4"
                >
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted" />
                    <div className="h-5 w-20 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">
                No jobs match your search. Try broadening your criteria.
              </p>
            </div>
          )}

          {jobs.map((job) => {
            const salary = formatSalary(job);
            const isSelected = selectedJob?.id === job.id;
            return (
              <div
                key={job.id}
                className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company_name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                      {salary && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(job.posted_at)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => fetchJobs(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchJobs(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Job Detail Panel */}
        <div className="lg:col-span-3">
          {selectedJob ? (
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                  <p className="mt-1 text-muted-foreground">
                    {selectedJob.company_name}
                  </p>
                </div>

                {/* Apply Button — links externally or prompts login */}
                {selectedJob.external_url ? (
                  <a
                    href={selectedJob.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Apply →
                  </a>
                ) : (
                  <Link
                    href="/sign-in"
                    className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign in to Apply
                  </Link>
                )}
              </div>

              {/* Meta info */}
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedJob.is_remote && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Remote
                  </span>
                )}
                {selectedJob.location_city && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    📍 {selectedJob.location_city}
                    {selectedJob.location_country &&
                      `, ${selectedJob.location_country}`}
                  </span>
                )}
                {selectedJob.employment_type && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">
                    {selectedJob.employment_type.replace("_", " ")}
                  </span>
                )}
                {formatSalary(selectedJob) && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {formatSalary(selectedJob)}
                  </span>
                )}
                {selectedJob.experience_years_min != null && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    {selectedJob.experience_years_min}
                    {selectedJob.experience_years_max != null
                      ? `–${selectedJob.experience_years_max}`
                      : "+"}{" "}
                    years exp.
                  </span>
                )}
              </div>

              {/* Skills */}
              {selectedJob.required_skills.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {selectedJob.required_skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {selectedJob.description && (
                <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {selectedJob.description}
                </div>
              )}

              {/* Source badge */}
              <p className="mt-4 text-xs text-muted-foreground">
                Source: {selectedJob.source} · Posted{" "}
                {timeAgo(selectedJob.posted_at)}
              </p>
            </div>
          ) : (
            <div className="hidden rounded-lg border border-dashed border-border p-12 text-center lg:block">
              <p className="text-muted-foreground">
                Select a job to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
