"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ─── Types ────────────────────────────────────────────────────────────────── */

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

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-pink-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(name)} text-sm font-bold text-white shadow-sm`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (job.salary_min && job.salary_max) {
    return `${job.salary_currency} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  }
  if (job.salary_min) return `${job.salary_currency} ${fmt(job.salary_min)}+`;
  return `Up to ${job.salary_currency} ${fmt(job.salary_max!)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatEmploymentType(type: string | null): string | null {
  if (!type) return null;
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Generate page number array with ellipsis: [1, 2, '...', 9, 10] */
function getPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
}

const PER_PAGE_OPTIONS = [10, 20, 50] as const;

const EMPLOYMENT_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

/* ─── Main Component ───────────────────────────────────────────────────────── */

export function PublicJobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchJobs = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (remoteOnly) params.set("remote", "true");
      if (employmentType) params.set("type", employmentType);
      if (locationFilter.trim()) params.set("location", locationFilter.trim());
      params.set("page", String(pageNum));
      params.set("limit", String(perPage));

      try {
        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setJobs(data.jobs);
        setTotal(data.total);
        setPage(pageNum);
        if (data.jobs.length > 0 && window.innerWidth >= 1024) {
          setSelectedJob(data.jobs[0]);
        } else {
          setSelectedJob(null);
        }
      } catch {
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [search, remoteOnly, employmentType, locationFilter, perPage],
  );

  useEffect(() => {
    fetchJobs(1);
  }, [remoteOnly, employmentType, perPage, fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const totalPages = Math.ceil(total / perPage);
  const showingFrom = total > 0 ? (page - 1) * perPage + 1 : 0;
  const showingTo = Math.min(page * perPage, total);

  const activeFilterCount =
    (remoteOnly ? 1 : 0) +
    (employmentType ? 1 : 0) +
    (locationFilter.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setRemoteOnly(false);
    setEmploymentType("");
    setLocationFilter("");
  };

  return (
    <div className="space-y-5">
      {/* ─── Search Bar ──────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Search jobs by title, company, or description..."
          />
        </div>
        <button
          type="submit"
          className="relative rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* ─── Filters Row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/50">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-3.5 w-3.5 rounded border accent-primary"
          />
          <span className="text-muted-foreground">Remote only</span>
        </label>

        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          {EMPLOYMENT_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchJobs(1)}
          placeholder="City or country..."
          className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />

        {(activeFilterCount > 0 || search.trim()) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ─── Results Count + Per Page ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Searching..."
            : total > 0
              ? `Showing ${showingFrom}–${showingTo} of ${total} jobs`
              : "No jobs found"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Per page:</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="rounded-lg border border-border/60 bg-card px-2 py-1 text-xs text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/10"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Job List + Detail Layout ─────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Job Cards Column */}
        <div className="space-y-3 lg:col-span-2">
          {/* Loading skeleton */}
          {loading && jobs.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-border/40 p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted" />
                    <div className="h-5 w-20 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && jobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-muted-foreground/30"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <p className="mt-3 font-medium text-muted-foreground">
                No jobs match your criteria
              </p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Try broadening your search or removing some filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Job cards */}
          {jobs.map((job) => {
            const salary = formatSalary(job);
            const isSelected = selectedJob?.id === job.id;
            const empType = formatEmploymentType(job.employment_type);
            return (
              <div
                key={job.id}
                className={`group cursor-pointer rounded-xl border-l-4 border border-border/40 p-4 transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? "border-l-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/10"
                    : "border-l-transparent hover:border-l-primary/40 hover:bg-muted/30"
                }`}
                onClick={() => setSelectedJob(job)}
              >
                {/* Header: Avatar + Title + Time */}
                <div className="flex items-start gap-3">
                  <CompanyAvatar name={job.company_name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <span className="shrink-0 rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {timeAgo(job.posted_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.company_name}
                    </p>
                  </div>
                </div>

                {/* Badges: Remote, Location, Salary */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {job.is_remote && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Remote
                    </span>
                  )}
                  {job.location_city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location_city}
                      {job.location_country ? `, ${job.location_country}` : ""}
                    </span>
                  )}
                  {salary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {salary}
                    </span>
                  )}
                </div>

                {/* Skills */}
                {job.required_skills.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1">
                    {job.required_skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{job.required_skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Type + Experience */}
                {(empType || job.experience_years_min != null) && (
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                    {empType && <span>{empType}</span>}
                    {empType && job.experience_years_min != null && (
                      <span className="h-3 w-px bg-border" />
                    )}
                    {job.experience_years_min != null && (
                      <span>
                        {job.experience_years_min}
                        {job.experience_years_max != null
                          ? `–${job.experience_years_max}`
                          : "+"}{" "}
                        yrs exp
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ─── Pagination ──────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button
                onClick={() => fetchJobs(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-border/60 p-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => fetchJobs(p)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => fetchJobs(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border/60 p-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* ─── Job Detail Panel ────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          {selectedJob ? (
            <div className="sticky top-24 rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="border-b border-border/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CompanyAvatar name={selectedJob.company_name} />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedJob.title}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {selectedJob.company_name}
                      </p>
                    </div>
                  </div>
                  {selectedJob.external_url ? (
                    <a
                      href={selectedJob.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Apply →
                    </a>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      Sign in to Apply
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedJob.is_remote && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Remote
                    </span>
                  )}
                  {selectedJob.location_city && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {selectedJob.location_city}
                      {selectedJob.location_country && `, ${selectedJob.location_country}`}
                    </span>
                  )}
                  {selectedJob.employment_type && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {formatEmploymentType(selectedJob.employment_type)}
                    </span>
                  )}
                  {formatSalary(selectedJob) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {formatSalary(selectedJob)}
                    </span>
                  )}
                  {selectedJob.experience_years_min != null && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {selectedJob.experience_years_min}
                      {selectedJob.experience_years_max != null
                        ? `–${selectedJob.experience_years_max}`
                        : "+"}{" "}
                      years exp
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {selectedJob.required_skills.length > 0 && (
                  <div className="mb-5">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.required_skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.description && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Description
                    </h4>
                    <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {selectedJob.description}
                    </div>
                  </div>
                )}

                <p className="mt-5 text-[11px] text-muted-foreground/50">
                  Source: {selectedJob.source} · Posted{" "}
                  {timeAgo(selectedJob.posted_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden rounded-xl border border-dashed border-border/40 p-16 text-center lg:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-muted-foreground/20"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <p className="mt-3 text-muted-foreground">
                Select a job to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
