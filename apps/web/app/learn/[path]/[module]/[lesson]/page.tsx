import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/mdx";
import { getModule, getPath } from "@/lib/content";
import { LessonContent } from "@/components/lesson/LessonContent";
import { TableOfContents } from "@/components/lesson/TableOfContents";
import { LessonNav } from "@/components/lesson/LessonNav";
import { Badge } from "@/components/ui/badge";

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

  // Find prev/next lessons
  const lessonIndex = moduleMeta.lessons.findIndex(
    (l) => l.slug === params.lesson,
  );
  const prevLesson = lessonIndex > 0 ? moduleMeta.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < moduleMeta.lessons.length - 1
      ? moduleMeta.lessons[lessonIndex + 1]
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/paths/${params.path}`} className="hover:text-foreground">
          {pathMeta.title}
        </Link>
        <span className="mx-2">/</span>
        <span>{moduleMeta.title}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{lesson.frontmatter.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="mb-8">
            <Badge variant="secondary">{moduleMeta.title}</Badge>
            <h1 className="mt-3 text-3xl font-bold">
              {lesson.frontmatter.title}
            </h1>
            {lesson.frontmatter.description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {lesson.frontmatter.description}
              </p>
            )}
            {lesson.frontmatter.estimatedMinutes && (
              <p className="mt-2 text-sm text-muted-foreground">
                Estimated time: {lesson.frontmatter.estimatedMinutes} minutes |
                XP: {lesson.frontmatter.xpReward || 25}
              </p>
            )}
          </div>

          {/* Learning Objectives */}
          {lesson.frontmatter.objectives &&
            lesson.frontmatter.objectives.length > 0 && (
              <div className="mb-8 rounded-lg border bg-muted/50 p-4">
                <h2 className="font-semibold">What you&apos;ll learn</h2>
                <ul className="mt-2 space-y-1">
                  {lesson.frontmatter.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">✓</span>
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
          />
        </div>

        {/* Table of Contents sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={lesson.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
