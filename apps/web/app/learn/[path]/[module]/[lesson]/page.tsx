import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLesson } from "@/lib/mdx";
import { getModule, getPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { LessonContent } from "@/components/lesson/LessonContent";
import { TableOfContents } from "@/components/lesson/TableOfContents";
import { LessonCompletionSection } from "@/components/lesson/LessonCompletion";
import { LessonProgressTracker } from "@/components/lesson/LessonProgressTracker";

interface LessonPageProps {
  params: Promise<{ path: string; module: string; lesson: string }>;
}

async function getLessonCompletionStatus(
  pathSlug: string,
  lessonSlug: string,
): Promise<boolean> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return false;

    const profileId = await getProfileId(clerkId);
    if (!profileId) return false;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("status")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .eq("lesson_slug", lessonSlug)
      .eq("status", "completed")
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { path: pathSlug, module: moduleSlug, lesson: lessonSlug } = await params;
  const lesson = await getLesson(pathSlug, moduleSlug, lessonSlug);
  if (!lesson) return { title: "Lesson Not Found" };

  return {
    title: lesson.frontmatter.title,
    description: lesson.frontmatter.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { path: pathSlug, module: moduleSlug, lesson: lessonSlug } = await params;

  const [lesson, pathMeta, moduleMeta, isCompleted] = await Promise.all([
    getLesson(pathSlug, moduleSlug, lessonSlug),
    Promise.resolve(getPath(pathSlug)),
    Promise.resolve(getModule(pathSlug, moduleSlug)),
    getLessonCompletionStatus(pathSlug, lessonSlug),
  ]);

  if (!lesson || !pathMeta || !moduleMeta) notFound();

  const lessonIndex = moduleMeta.lessons.findIndex(
    (l) => l.slug === lessonSlug,
  );
  const prevLesson =
    lessonIndex > 0 ? moduleMeta.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < moduleMeta.lessons.length - 1
      ? moduleMeta.lessons[lessonIndex + 1]
      : null;

  const xpReward = lesson.frontmatter.xpReward || 25;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6 lg:px-8">
      {/* Auto-track lesson as in_progress on visit */}
      <LessonProgressTracker
        pathSlug={pathSlug}
        moduleSlug={moduleSlug}
        lessonSlug={lessonSlug}
        skip={isCompleted}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-[13px]"
      >
        <Link
          href={`/paths/${pathSlug}`}
          className="font-medium text-foreground/50 transition-colors hover:text-primary"
        >
          {pathMeta.title}
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground/25"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="font-medium text-foreground/50">
          {moduleMeta.title}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground/25"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span
          className="truncate font-semibold text-foreground"
          aria-current="page"
        >
          {lesson.frontmatter.title}
        </span>
      </nav>

      {/* Two-column: content + TOC */}
      <div className="flex gap-8">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Lesson header */}
          <header className="mb-12">
            <Link
              href={`/paths/${pathSlug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {moduleMeta.title}
            </Link>

            <h1 className="mt-4 text-[2.25rem] font-extrabold leading-[1.2] tracking-tight text-foreground">
              {lesson.frontmatter.title}
            </h1>

            {lesson.frontmatter.description && (
              <p className="mt-4 max-w-[38rem] text-lg leading-relaxed text-foreground/80">
                {lesson.frontmatter.description}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {lesson.frontmatter.estimatedMinutes && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground/60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {lesson.frontmatter.estimatedMinutes} min read
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                Lesson {lessonIndex + 1} of {moduleMeta.lessons.length}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {xpReward} XP
              </span>
            </div>
          </header>

          {/* Learning Objectives */}
          {lesson.frontmatter.objectives &&
            lesson.frontmatter.objectives.length > 0 && (
              <div className="mb-12 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-6">
                <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-primary">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  What you&apos;ll learn
                </h2>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {lesson.frontmatter.objectives.map(
                    (obj: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg bg-white/50 px-3 py-2.5 dark:bg-white/[0.03]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0 text-primary"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-sm leading-snug text-foreground">
                          {obj}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          <LessonContent source={lesson.source} />

          {/* Completion + Navigation */}
          <LessonCompletionSection
            pathSlug={pathSlug}
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            xpReward={xpReward}
            initialCompleted={isCompleted}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
          />
        </div>

        {/* Right sidebar — Table of Contents */}
        <aside className="hidden w-[200px] shrink-0 xl:block">
          <div className="sticky top-[4.5rem]">
            <TableOfContents headings={lesson.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
