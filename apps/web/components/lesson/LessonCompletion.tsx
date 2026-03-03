"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CompletionReflectionModal } from "./CompletionReflectionModal";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface LessonCompletionProps {
  pathSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  xpReward: number;
  initialCompleted?: boolean;
  keyTakeaways?: string[];
  reflectionPrompt?: string;
}

type CompletionState = "idle" | "completed";

/* ─── Completion Button + Modal ─────────────────────────────────────────────── */

function LessonCompletion({
  pathSlug,
  moduleSlug,
  lessonSlug,
  lessonTitle,
  xpReward,
  initialCompleted = false,
  keyTakeaways,
  reflectionPrompt,
}: LessonCompletionProps) {
  const router = useRouter();
  const [state, setState] = useState<CompletionState>(
    initialCompleted ? "completed" : "idle",
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    if (state !== "idle") return;
    setModalOpen(true);
  }, [state]);

  const handleConfirmCompletion = useCallback(async () => {
    const res = await fetch("/api/progress/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathSlug,
        moduleSlug,
        lessonSlug,
        status: "completed",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Failed to mark lesson as complete");
    }

    setState("completed");

    // Re-fetch server component data so the sidebar, progress bar,
    // and lesson checkmarks update without a full page reload
    router.refresh();
  }, [pathSlug, moduleSlug, lessonSlug, router]);

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={state !== "idle"}
        onClick={handleOpenModal}
        className={cn(
          "group relative flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          state === "idle" &&
            "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
          state === "completed" &&
            "cursor-default bg-emerald-600 text-white dark:bg-emerald-600",
        )}
      >
        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>

        {/* Label */}
        <span>
          {state === "idle" && "Mark Lesson as Complete"}
          {state === "completed" && "Lesson Completed!"}
        </span>

        {/* XP Badge */}
        <span
          className={cn(
            "ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
            state === "idle" && "bg-white/20 text-white",
            state === "completed" && "bg-white/20 text-white",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          +{xpReward} XP
        </span>
      </button>

      {/* Reflection Modal */}
      <CompletionReflectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        lessonTitle={lessonTitle}
        keyTakeaways={keyTakeaways}
        reflectionPrompt={reflectionPrompt}
        xpReward={xpReward}
        onConfirm={handleConfirmCompletion}
      />
    </div>
  );
}

/* ─── LessonCompletionSection ───────────────────────────────────────────────── */
/*  Full-width wrapper placed between lesson content and navigation.            */

interface LessonCompletionSectionProps extends LessonCompletionProps {
  prevLesson?: { slug: string; title: string } | null;
  nextLesson?: { slug: string; title: string } | null;
}

export function LessonCompletionSection({
  pathSlug,
  moduleSlug,
  lessonSlug,
  lessonTitle,
  xpReward,
  initialCompleted = false,
  keyTakeaways,
  reflectionPrompt,
  prevLesson,
  nextLesson,
}: LessonCompletionSectionProps) {
  return (
    <div className="mt-12 border-t border-border/60 pt-8">
      {/* Heading */}
      <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">
        Ready to continue?
      </p>

      {/* Completion button (opens reflection modal) */}
      <LessonCompletion
        pathSlug={pathSlug}
        moduleSlug={moduleSlug}
        lessonSlug={lessonSlug}
        lessonTitle={lessonTitle}
        xpReward={xpReward}
        initialCompleted={initialCompleted}
        keyTakeaways={keyTakeaways}
        reflectionPrompt={reflectionPrompt}
      />

      {/* Prev / Next navigation */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prevLesson ? (
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${prevLesson.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Previous</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                {prevLesson.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${nextLesson.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border-2 border-primary/20 bg-primary/[0.03] p-4 text-right transition-all hover:border-primary/50 hover:bg-primary/[0.06] hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">Next Lesson</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                {nextLesson.title}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </Link>
        ) : (
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] p-4 text-right transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Course Complete</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Back to Course Overview
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
