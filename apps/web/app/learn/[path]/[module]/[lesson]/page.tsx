import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/mdx";
import { getModule, getPath } from "@/lib/content";
import { LessonContent } from "@/components/lesson/LessonContent";
import { TableOfContents } from "@/components/lesson/TableOfContents";
import { LessonNav } from "@/components/lesson/LessonNav";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";

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
      <ReadingProgress />

      <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link href={`/paths/${params.path}`} className="hover:text-foreground transition-colors">
            {pathMeta.title}
          </Link>
          <span className="text-border">/</span>
          <span className="truncate text-foreground font-medium">{lesson.frontmatter.title}</span>
        </nav>

        {/* Three-column layout */}
        <div className="flex gap-8">
          {/* Left sidebar — lesson navigation */}
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
            <header className="mb-10">
              <div className="flex items-center gap-2">
                <Link
                  href={`/paths/${params.path}`}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  {moduleMeta.title}
                </Link>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {lesson.frontmatter.title}
              </h1>

              {lesson.frontmatter.description && (
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  {lesson.frontmatter.description}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {lesson.frontmatter.estimatedMinutes && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {lesson.frontmatter.estimatedMinutes} min read
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  Lesson {lessonIndex + 1} of {moduleMeta.lessons.length}
                </span>
                {(lesson.frontmatter.xpReward || 25) && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {lesson.frontmatter.xpReward || 25} XP
                  </span>
                )}
              </div>
            </header>

            {/* Learning Objectives */}
            {lesson.frontmatter.objectives &&
              lesson.frontmatter.objectives.length > 0 && (
                <div className="mb-10 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    What you&apos;ll learn
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {lesson.frontmatter.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {obj}
                      </li>
                    ))}
                  </ul>
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
          <aside className="hidden w-[200px] shrink-0 lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={lesson.headings} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
