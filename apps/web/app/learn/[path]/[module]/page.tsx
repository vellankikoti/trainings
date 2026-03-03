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
  const nextModule = moduleIndex < allModules.length - 1
    ? allModules[moduleIndex + 1]
    : null;

  const { completedSlugs, totalXpEarned } = await getCourseCompletionData(
    pathSlug,
    moduleSlug,
  );

  const completedCount = completedSlugs.size;
  const totalLessons = moduleMeta.lessons.length;
  const progress = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  const totalXpAvailable = totalLessons * 25;
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
      {/* Course header — no back link (sidebar handles navigation) */}
      <div>
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
        <Stat icon={<BookIcon />} value={`${totalLessons}`} label="Lessons" />
        <Stat icon={<ClockIcon />} value={`${moduleMeta.estimatedHours}h`} label="Est. Time" />
        <Stat icon={<BoltIcon />} value={`${totalXpAvailable}`} label="XP Available" />
        <Stat icon={<SignalIcon />} value={pathMeta.difficulty} label="Level" />
      </div>

      {/* Progress card */}
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

      {/* Completion summary — shown when module is 100% done */}
      {isComplete && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 p-6 dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-transparent">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
              <TrophyIcon />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                Course Complete!
              </h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400/80">
                You&apos;ve completed all {totalLessons} lessons in {moduleMeta.title}.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <BoltIcon /> {totalXpEarned} XP earned
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <BookIcon /> {totalLessons} lessons
                </span>
              </div>
            </div>
          </div>

          {/* Next module CTA */}
          {nextModule ? (
            <Link
              href={`/learn/${pathSlug}/${nextModule.slug}`}
              className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:hover:border-primary/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Next Course
                </p>
                <p className="text-sm font-bold text-foreground">
                  {nextModule.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4 text-center dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <p className="text-sm font-semibold text-foreground">
                You&apos;ve completed all courses in {pathMeta.title}!
              </p>
              <Link
                href="/paths"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Explore more paths
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-8">
        <Link
          href={resumeHref}
          className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          {isComplete
            ? "Review Lessons"
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

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground">
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

/* ─── Stat + Icons (unchanged) ──────────────────────────────────────────────── */

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">{icon}</div>
      <div>
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function BookIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
}

function ClockIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
}

function BoltIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
}

function SignalIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /></svg>);
}

function TrophyIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>);
}
