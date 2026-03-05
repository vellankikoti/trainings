"use client";

import { useState } from "react";
import { ResetProgressDialog } from "@/components/progress/ResetProgressDialog";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface CourseActionsProps {
  pathSlug: string;
  moduleSlug: string;
  courseTitle: string;
  isComplete: boolean;
  certificateCode?: string | null;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CourseActions({
  pathSlug,
  moduleSlug,
  courseTitle,
  isComplete,
  certificateCode,
}: CourseActionsProps) {
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View Certificate — only for completed courses with a certificate */}
      {isComplete && certificateCode && (
        <a
          href={`/certificates/${certificateCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="14" x="3" y="5" rx="2" />
            <path d="M3 10h18" />
          </svg>
          View Certificate
        </a>
      )}

      {/* Download PDF — only for completed courses with a certificate */}
      {isComplete && certificateCode && (
        <a
          href={`/api/certificates/${certificateCode}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download PDF
        </a>
      )}

      {/* Reset Progress — for any started/completed course */}
      <button
        type="button"
        onClick={() => setResetOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-card px-3 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.98]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset Progress
      </button>

      {/* Reset Dialog */}
      <ResetProgressDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        scope="module"
        pathSlug={pathSlug}
        moduleSlug={moduleSlug}
        title={courseTitle}
      />
    </div>
  );
}
