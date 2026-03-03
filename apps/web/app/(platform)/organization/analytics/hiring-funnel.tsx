"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FunnelData {
  applied: number;
  viewed: number;
  shortlisted: number;
  contacted: number;
  hired: number;
  rejected: number;
  total: number;
}

interface JobPerformance {
  id: string;
  title: string;
  isActive: boolean;
  postedAt: string;
  applicationCount: number;
}

interface RecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  jobTitle: string;
  candidateName: string;
  candidateUsername: string | null;
}

interface AnalyticsData {
  funnel: FunnelData;
  interactions: Record<string, number>;
  jobPerformance: JobPerformance[];
  recentApplications: RecentApplication[];
}

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-500",
  viewed: "bg-slate-400",
  shortlisted: "bg-amber-500",
  contacted: "bg-purple-500",
  hired: "bg-emerald-500",
  rejected: "bg-red-400",
};

export function HiringFunnel({ orgId }: { orgId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/organizations/${orgId}/analytics`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  const { funnel, interactions, jobPerformance, recentApplications } = data;

  const funnelStages = [
    { label: "Applied", value: funnel.applied, color: STATUS_COLORS.applied },
    { label: "Viewed", value: funnel.viewed, color: STATUS_COLORS.viewed },
    {
      label: "Shortlisted",
      value: funnel.shortlisted,
      color: STATUS_COLORS.shortlisted,
    },
    {
      label: "Contacted",
      value: funnel.contacted,
      color: STATUS_COLORS.contacted,
    },
    { label: "Hired", value: funnel.hired, color: STATUS_COLORS.hired },
  ];

  const maxFunnel = Math.max(...funnelStages.map((s) => s.value), 1);

  return (
    <div className="space-y-8">
      {/* Hiring Funnel */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Hiring Funnel</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          {funnel.total === 0 ? (
            <p className="text-center text-muted-foreground">
              No applications yet. Data will appear once candidates apply.
            </p>
          ) : (
            <div className="space-y-3">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium">
                    {stage.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-muted">
                      <div
                        className={`h-8 rounded-lg ${stage.color} flex items-center px-3 transition-all`}
                        style={{
                          width: `${Math.max(5, (stage.value / maxFunnel) * 100)}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {stage.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                    {funnel.total > 0
                      ? `${Math.round((stage.value / funnel.total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-4 border-t border-border pt-3">
                <span className="w-24 text-sm font-medium text-red-600">
                  Rejected
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {funnel.rejected}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interaction Summary */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recruiter Activity</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { key: "profile_viewed", label: "Profiles Viewed" },
            { key: "shortlisted", label: "Shortlisted" },
            { key: "contacted", label: "Contacted" },
            { key: "interview_scheduled", label: "Interviews" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-card p-5"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {interactions[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Job Performance */}
      {jobPerformance.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Job Performance</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Posted
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Applications
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobPerformance.map((job) => (
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/organization/jobs/${job.id}`}
                        className="hover:text-primary"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          job.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {job.applicationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Applications</h2>
          <div className="space-y-2">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{app.candidateName}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied for {app.jobTitle}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[app.status]
                        ? `${app.status === "applied" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : app.status === "hired" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : app.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground"}`
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
