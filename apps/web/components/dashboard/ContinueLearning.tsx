import Link from "next/link";
import type { ResumeTarget } from "@/lib/dashboard";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface ContinueLearningProps {
  resumeTarget: ResumeTarget | null;
}

export function ContinueLearning({ resumeTarget }: ContinueLearningProps) {
  if (!resumeTarget) {
    return (
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.04] to-transparent p-6">
        <h2 className="text-lg font-bold text-foreground">
          Start Your DevOps Journey
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a course from the catalog to begin learning.
        </p>
        <Link
          href="/paths"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Browse Courses
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
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    );
  }

  const lessonHref = `/learn/${resumeTarget.pathSlug}/${resumeTarget.moduleSlug}/${resumeTarget.lessonSlug}`;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Continue Learning
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {resumeTarget.moduleTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Next: {resumeTarget.lessonTitle}
          </p>
          <div className="mt-3 max-w-xs">
            <ProgressBar
              value={resumeTarget.courseProgress}
              size="md"
              showLabel
              ariaLabel={`${resumeTarget.moduleTitle} progress`}
            />
          </div>
        </div>
        <Link
          href={lessonHref}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          Resume
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
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
