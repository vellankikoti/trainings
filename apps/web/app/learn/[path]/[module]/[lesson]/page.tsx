import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/mdx";
import { getModule, getPath } from "@/lib/content";
import { LessonContent } from "@/components/lesson/LessonContent";
import { TableOfContents } from "@/components/lesson/TableOfContents";
import { LessonNav } from "@/components/lesson/LessonNav";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";

interface LessonPageProps {
  params: { path: string; module: string; lesson: string };
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const lesson = await getLesson(params.path, params.module, params.lesson);
  if (!lesson) return { title: "Lesson Not Found" };

  return {
    title: lesson.frontmatter.title,
    description: lesson.frontmatter.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const [lesson, pathMeta, moduleMeta] = await Promise.all([
    getLesson(params.path, params.module, params.lesson),
    Promise.resolve(getPath(params.path)),
    Promise.resolve(getModule(params.path, params.module)),
  ]);

  if (!lesson || !pathMeta || !moduleMeta) notFound();

  const lessonIndex = moduleMeta.lessons.findIndex(
    (l) => l.slug === params.lesson,
  );
  const prevLesson = lessonIndex > 0 ? moduleMeta.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < moduleMeta.lessons.length - 1
      ? moduleMeta.lessons[lessonIndex + 1]
      : null;

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-[13px]">
          <Link href="/" className="font-medium text-foreground/60 hover:text-primary transition-colors">
            Home
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <Link href={`/paths/${params.path}`} className="font-medium text-foreground/60 hover:text-primary transition-colors">
            {pathMeta.title}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="truncate text-foreground font-semibold">{lesson.frontmatter.title}</span>
        </nav>

        {/* Three-column layout */}
        <div className="flex gap-8">
          {/* Left sidebar */}
          <aside className="hidden w-[260px] shrink-0 xl:block">
            <div className="sticky top-24">
              <LessonSidebar
                pathSlug={params.path}
                moduleSlug={params.module}
                moduleTitle={moduleMeta.title}
                lessons={moduleMeta.lessons}
                currentLessonSlug={params.lesson}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Lesson header */}
            <header className="mb-12">
              <Link
                href={`/paths/${params.path}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                {moduleMeta.title}
              </Link>

              <h1 className="mt-4 text-[2.25rem] font-extrabold tracking-tight leading-[1.2] text-foreground">
                {lesson.frontmatter.title}
              </h1>

              {lesson.frontmatter.description && (
                <p className="mt-4 text-lg leading-relaxed text-foreground/70 max-w-[38rem]">
                  {lesson.frontmatter.description}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {lesson.frontmatter.estimatedMinutes && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {lesson.frontmatter.estimatedMinutes} min read
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  Lesson {lessonIndex + 1} of {moduleMeta.lessons.length}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  {lesson.frontmatter.xpReward || 25} XP
                </span>
              </div>
            </header>

            {/* Learning Objectives */}
            {lesson.frontmatter.objectives &&
              lesson.frontmatter.objectives.length > 0 && (
                <div className="mb-12 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-6">
                  <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-primary">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    What you&apos;ll learn
                  </h2>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {lesson.frontmatter.objectives.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white/50 dark:bg-white/[0.03] px-3 py-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-sm leading-snug text-foreground/80">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <LessonContent source={lesson.source} />

            <LessonNav
              pathSlug={params.path}
              moduleSlug={params.module}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              currentIndex={lessonIndex}
              totalLessons={moduleMeta.lessons.length}
            />
          </div>

          {/* Right sidebar — Table of Contents */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={lesson.headings} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
