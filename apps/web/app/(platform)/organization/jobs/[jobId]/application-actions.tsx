"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "applied",
  "viewed",
  "shortlisted",
  "contacted",
  "rejected",
  "hired",
] as const;

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  viewed: "bg-muted text-muted-foreground",
  shortlisted:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  contacted:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  hired:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

interface ApplicationActionsProps {
  applicationId: string;
  orgId: string;
  jobId: string;
  currentStatus: string;
}

export function ApplicationActions({
  applicationId,
  orgId,
  jobId,
  currentStatus,
}: ApplicationActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(
        `/api/organizations/${orgId}/jobs/${jobId}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => updateStatus(e.target.value)}
      disabled={updating}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
