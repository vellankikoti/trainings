import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LessonNavProps {
  pathSlug: string;
  moduleSlug: string;
  prevLesson?: { slug: string; title: string } | null;
  nextLesson?: { slug: string; title: string } | null;
}

export function LessonNav({
  pathSlug,
  moduleSlug,
  prevLesson,
  nextLesson,
}: LessonNavProps) {
  return (
    <div className="mt-12 flex items-center justify-between border-t pt-6">
      {prevLesson ? (
        <Button variant="outline" asChild>
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${prevLesson.slug}`}
          >
            &larr; {prevLesson.title}
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {nextLesson ? (
        <Button asChild>
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${nextLesson.slug}`}
          >
            {nextLesson.title} &rarr;
          </Link>
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link href={`/paths/${pathSlug}`}>Back to Path Overview</Link>
        </Button>
      )}
    </div>
  );
}
