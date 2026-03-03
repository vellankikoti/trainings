/**
 * Job Aggregation Service — fetches jobs from external APIs and upserts into job_postings.
 *
 * Supported providers (activated via env vars):
 * - JSearch (RapidAPI)  → JSEARCH_API_KEY
 * - Adzuna              → ADZUNA_APP_ID + ADZUNA_API_KEY
 *
 * Usage:
 *   Called by a cron/scheduled endpoint (e.g., /api/jobs/aggregate)
 *   or manually by an admin.
 */

import { createAdminClient } from "@/lib/supabase/server";

export interface ExternalJob {
  source: string;
  externalId: string;
  externalUrl: string;
  title: string;
  description: string | null;
  companyName: string;
  locationCity: string | null;
  locationCountry: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  requiredSkills: string[];
  employmentType: string | null;
  postedAt: string;
}

// ─── Provider Interfaces ─────────────────────────────────────────────────────

interface JobProvider {
  name: string;
  isConfigured(): boolean;
  fetchJobs(query: string, page?: number): Promise<ExternalJob[]>;
}

// ─── JSearch (RapidAPI) ──────────────────────────────────────────────────────

const jsearchProvider: JobProvider = {
  name: "jsearch",

  isConfigured() {
    return !!process.env.JSEARCH_API_KEY;
  },

  async fetchJobs(query: string, page = 1): Promise<ExternalJob[]> {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) return [];

    const params = new URLSearchParams({
      query,
      page: String(page),
      num_pages: "1",
    });

    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.data ?? []).map(
      (j: Record<string, unknown>): ExternalJob => ({
        source: "jsearch",
        externalId: String(j.job_id ?? ""),
        externalUrl: String(j.job_apply_link ?? j.job_google_link ?? ""),
        title: String(j.job_title ?? ""),
        description: j.job_description ? String(j.job_description) : null,
        companyName: String(j.employer_name ?? ""),
        locationCity: j.job_city ? String(j.job_city) : null,
        locationCountry: j.job_country ? String(j.job_country) : null,
        isRemote: j.job_is_remote === true,
        salaryMin: typeof j.job_min_salary === "number" ? j.job_min_salary : null,
        salaryMax: typeof j.job_max_salary === "number" ? j.job_max_salary : null,
        salaryCurrency: String(j.job_salary_currency ?? "USD"),
        requiredSkills: [],
        employmentType: j.job_employment_type
          ? String(j.job_employment_type).toLowerCase()
          : null,
        postedAt: j.job_posted_at_datetime_utc
          ? String(j.job_posted_at_datetime_utc)
          : new Date().toISOString(),
      }),
    );
  },
};

// ─── Adzuna ──────────────────────────────────────────────────────────────────

const adzunaProvider: JobProvider = {
  name: "adzuna",

  isConfigured() {
    return !!process.env.ADZUNA_APP_ID && !!process.env.ADZUNA_API_KEY;
  },

  async fetchJobs(query: string, page = 1): Promise<ExternalJob[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;
    if (!appId || !apiKey) return [];

    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      what: query,
      results_per_page: "50",
      content_type: "application/json",
    });

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/${page}?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? []).map(
      (j: Record<string, unknown>): ExternalJob => ({
        source: "adzuna",
        externalId: String(j.id ?? ""),
        externalUrl: String(j.redirect_url ?? ""),
        title: String(j.title ?? ""),
        description: j.description ? String(j.description) : null,
        companyName: String(
          (j.company as Record<string, unknown>)?.display_name ?? "",
        ),
        locationCity: (j.location as Record<string, unknown>)?.area
          ? String(
              (
                (j.location as Record<string, unknown>)?.area as string[]
              )?.slice(-1)?.[0] ?? "",
            )
          : null,
        locationCountry: "US",
        isRemote:
          String(j.title ?? "")
            .toLowerCase()
            .includes("remote") ||
          String(j.description ?? "")
            .toLowerCase()
            .includes("remote"),
        salaryMin:
          typeof j.salary_min === "number" ? Math.round(j.salary_min) : null,
        salaryMax:
          typeof j.salary_max === "number" ? Math.round(j.salary_max) : null,
        salaryCurrency: "USD",
        requiredSkills: [],
        employmentType:
          String(j.contract_type ?? "").toLowerCase() || null,
        postedAt: j.created ? String(j.created) : new Date().toISOString(),
      }),
    );
  },
};

// ─── Remotive (Free, No Key) ─────────────────────────────────────────────────

const remotiveProvider: JobProvider = {
  name: "remotive",

  isConfigured() {
    return true; // Always available — no API key needed
  },

  async fetchJobs(query: string): Promise<ExternalJob[]> {
    // Remotive uses category-based filtering, not free text search
    // Map common DevOps queries to Remotive categories
    const categoryMap: Record<string, string> = {
      devops: "devops",
      sre: "devops",
      "site reliability": "devops",
      kubernetes: "devops",
      cloud: "devops",
      software: "software-dev",
      data: "data",
      qa: "qa",
    };

    const category =
      Object.entries(categoryMap).find(([key]) =>
        query.toLowerCase().includes(key),
      )?.[1] ?? "devops";

    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${category}&limit=50`,
      { next: { revalidate: 21600 } }, // cache 6 hours
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.jobs ?? []).map(
      (j: Record<string, unknown>): ExternalJob => ({
        source: "remotive",
        externalId: String(j.id ?? ""),
        externalUrl: String(j.url ?? ""),
        title: String(j.title ?? ""),
        description: j.description ? String(j.description) : null,
        companyName: String(j.company_name ?? ""),
        locationCity: null,
        locationCountry: null,
        isRemote: true, // Remotive is all remote jobs
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: "USD",
        requiredSkills: Array.isArray(j.tags)
          ? (j.tags as string[]).slice(0, 10)
          : [],
        employmentType: j.job_type
          ? String(j.job_type).toLowerCase()
          : null,
        postedAt: j.publication_date
          ? String(j.publication_date)
          : new Date().toISOString(),
      }),
    );
  },
};

// ─── Arbeitnow (Free, No Key) ───────────────────────────────────────────────

const arbeitnowProvider: JobProvider = {
  name: "arbeitnow",

  isConfigured() {
    return true; // Always available — no API key needed
  },

  async fetchJobs(_query: string, page = 1): Promise<ExternalJob[]> {
    const res = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?page=${page}`,
      { next: { revalidate: 21600 } },
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.data ?? []).map(
      (j: Record<string, unknown>): ExternalJob => ({
        source: "arbeitnow",
        externalId: String(j.slug ?? ""),
        externalUrl: String(j.url ?? ""),
        title: String(j.title ?? ""),
        description: j.description ? String(j.description) : null,
        companyName: String(j.company_name ?? ""),
        locationCity: j.location ? String(j.location) : null,
        locationCountry: null,
        isRemote: j.remote === true,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: "EUR",
        requiredSkills: Array.isArray(j.tags)
          ? (j.tags as string[]).slice(0, 10)
          : [],
        employmentType: null,
        postedAt: j.created_at
          ? new Date((j.created_at as number) * 1000).toISOString()
          : new Date().toISOString(),
      }),
    );
  },
};

// ─── Aggregation Engine ──────────────────────────────────────────────────────

const providers: JobProvider[] = [
  remotiveProvider,   // Free, no key — remote tech jobs
  arbeitnowProvider,  // Free, no key — EU tech jobs
  adzunaProvider,     // Free with registration — global
  jsearchProvider,    // Free tier ~500 req/month — Google Jobs
];

/**
 * Fetch jobs from all configured providers and upsert into database.
 * Returns count of new jobs inserted.
 */
export async function aggregateJobs(
  queries: string[] = ["devops engineer", "site reliability engineer", "kubernetes"],
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const supabase = createAdminClient();
  const allJobs: ExternalJob[] = [];
  const errors: string[] = [];

  const activeProviders = providers.filter((p) => p.isConfigured());

  if (activeProviders.length === 0) {
    return { inserted: 0, skipped: 0, errors: ["No job providers configured"] };
  }

  // Fetch from all providers
  for (const provider of activeProviders) {
    for (const query of queries) {
      try {
        const jobs = await provider.fetchJobs(query);
        allJobs.push(...jobs);
      } catch (err) {
        errors.push(
          `${provider.name}/${query}: ${err instanceof Error ? err.message : "unknown error"}`,
        );
      }
    }
  }

  // Deduplicate by source + externalId
  const seen = new Set<string>();
  const unique = allJobs.filter((j) => {
    const key = `${j.source}:${j.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let inserted = 0;
  let skipped = 0;

  // Upsert into database
  for (const job of unique) {
    const { error } = await supabase.from("job_postings").upsert(
      {
        source: job.source,
        external_id: job.externalId,
        external_url: job.externalUrl,
        title: job.title,
        description: job.description,
        company_name: job.companyName,
        location_city: job.locationCity,
        location_country: job.locationCountry,
        is_remote: job.isRemote,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        salary_currency: job.salaryCurrency,
        required_skills: job.requiredSkills,
        employment_type: job.employmentType,
        posted_at: job.postedAt,
        is_active: true,
      },
      { onConflict: "source,external_id", ignoreDuplicates: true },
    );

    if (error) {
      skipped++;
    } else {
      inserted++;
    }
  }

  return { inserted, skipped, errors };
}

/**
 * Extract skills from job description using keyword matching.
 * Used to enrich job_postings.required_skills after aggregation.
 */
export function extractSkillsFromDescription(description: string): string[] {
  const skillKeywords = [
    "linux",
    "docker",
    "kubernetes",
    "k8s",
    "aws",
    "azure",
    "gcp",
    "terraform",
    "ansible",
    "jenkins",
    "gitlab",
    "github actions",
    "ci/cd",
    "python",
    "bash",
    "go",
    "golang",
    "prometheus",
    "grafana",
    "datadog",
    "nginx",
    "redis",
    "postgresql",
    "mysql",
    "mongodb",
    "helm",
    "argocd",
    "istio",
    "envoy",
    "kafka",
    "rabbitmq",
    "elasticsearch",
    "cloudformation",
    "pulumi",
    "vault",
    "consul",
    "nomad",
    "packer",
    "vagrant",
    "git",
    "jira",
    "splunk",
    "new relic",
    "pagerduty",
  ];

  const lower = description.toLowerCase();
  return skillKeywords.filter((skill) => lower.includes(skill));
}
