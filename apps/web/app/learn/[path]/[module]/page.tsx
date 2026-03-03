import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPath, getModule, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface CoursePageProps {
  params: Promise<{ path: string; module: string }>;
}

async function getCourseCompletionData(
  pathSlug: string,
  moduleSlug: string,
): Promise<{ completedSlugs: Set<string>; totalXpEarned: number }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { completedSlugs: new Set(), totalXpEarned: 0 };

    const profileId = await getProfileId(clerkId);
    if (!profileId) return { completedSlugs: new Set(), totalXpEarned: 0 };

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_slug, status, xp_earned")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .eq("module_slug", moduleSlug);

    const completed = new Set<string>();
    let xp = 0;
    for (const row of data ?? []) {
      if (row.status === "completed") {
        completed.add(row.lesson_slug);
        xp += row.xp_earned ?? 0;
      }
    }
    return { completedSlugs: completed, totalXpEarned: xp };
  } catch {
    return { completedSlugs: new Set(), totalXpEarned: 0 };
  }
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { path: pathSlug, module: moduleSlug } = await params;
  const moduleMeta = getModule(pathSlug, moduleSlug);
  if (!moduleMeta) return { title: "Course Not Found" };

  return {
    title: `${moduleMeta.title} — Course Overview`,
    description: moduleMeta.description,
  };
}

export default async function CourseOverviewPage({ params }: CoursePageProps) {
  const { path: pathSlug, module: moduleSlug } = await params;

  const pathMeta = getPath(pathSlug);
  const moduleMeta = getModule(pathSlug, moduleSlug);
  if (!pathMeta || !moduleMeta) notFound();

  const allModules = getModulesForPath(pathSlug);
  const moduleIndex = allModules.findIndex((m) => m.slug === moduleSlug);
  const courseNumber = moduleIndex + 1;
  const totalCourses = allModules.length;

  const { completedSlugs, totalXpEarned } = await getCourseCompletionData(
    pathSlug,
    moduleSlug,
  );

  const completedCount = completedSlugs.size;
  const totalLessons = moduleMeta.lessons.length;
  const progress = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const totalXpAvailable = totalLessons * 25; // Base XP per lesson
  const isStarted = completedCount > 0;
  const isComplete = completedCount === totalLessons;

  // Find resume lesson: first incomplete
  const resumeLesson = moduleMeta.lessons.find(
    (l) => !completedSlugs.has(l.slug),
  );
  const resumeHref = resumeLesson
    ? `/learn/${pathSlug}/${moduleSlug}/${resumeLesson.slug}`
    : `/learn/${pathSlug}/${moduleSlug}/${moduleMeta.lessons[0]?.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
      {/* Back link */}
      <Link
        href={`/paths/${pathSlug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {pathMeta.title}
      </Link>

      {/* Course header */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Course {courseNumber} of {totalCourses}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
          {moduleMeta.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {moduleMeta.description}
        </p>
      </div>

      {/* Stats strip */}
      <div className="mt-8 flex flex-wrap gap-6">
        <Stat
          icon={<BookIcon />}
          value={`${totalLessons}`}
          label="Lessons"
        />
        <Stat
          icon={<ClockIcon />}
          value={`${moduleMeta.estimatedHours}h`}
          label="Est. Time"
        />
        <Stat
          icon={<BoltIcon />}
          value={`${totalXpAvailable}`}
          label="XP Available"
        />
        <Stat
          icon={<SignalIcon />}
          value={pathMeta.difficulty}
          label="Level"
        />
      </div>

      {/* Progress card — only if started */}
      {isStarted && (
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Your Progress</p>
            {isComplete && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Complete
              </span>
            )}
          </div>
          <div className="mt-3">
            <ProgressBar value={progress} size="md" showLabel ariaLabel={`${moduleMeta.title} progress`} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {totalLessons} lessons completed</span>
            {totalXpEarned > 0 && <span>{totalXpEarned} XP earned</span>}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-8">
        <Link
          href={resumeHref}
          className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          {isComplete
            ? "Review Course"
            : isStarted
              ? "Continue Course"
              : "Start Course"}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* Syllabus */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-foreground">Syllabus</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalLessons} lessons · {moduleMeta.estimatedHours} hours total
        </p>

        <div className="mt-6 space-y-1">
          {moduleMeta.lessons.map((lesson, i) => {
            const isDone = completedSlugs.has(lesson.slug);
            const isCurrent = resumeLesson?.slug === lesson.slug;

            return (
              <Link
                key={lesson.slug}
                href={`/learn/${pathSlug}/${moduleSlug}/${lesson.slug}`}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all ${
                  isCurrent
                    ? "bg-primary/[0.06] border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Status indicator */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {isDone ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </div>
                  )}
                </div>

                {/* Lesson info */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold transition-colors ${
                    isDone
                      ? "text-muted-foreground"
                      : isCurrent
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                  }`}>
                    {lesson.title}
                  </p>
                </div>

                {/* Right arrow on hover */}
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
                  className="shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Stat helper ───────────────────────────────────────────────────────────── */

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────────────── */

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
    </svg>
  );
}
