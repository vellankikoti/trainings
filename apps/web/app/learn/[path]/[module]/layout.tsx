import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPath, getModule } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { CourseShell } from "@/components/learn/CourseShell";
import type { CourseLessonRef } from "@/components/learn/CourseSidebar";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ path: string; module: string }>;
}

/**
 * Fetch completed lesson slugs for THIS MODULE ONLY.
 * Course-scoped — never fetches path-wide data.
 */
async function getModuleCompletedLessons(
  pathSlug: string,
  moduleSlug: string,
): Promise<string[]> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return [];

    const profileId = await getProfileId(clerkId);
    if (!profileId) return [];

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_slug")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .eq("module_slug", moduleSlug)
      .eq("status", "completed");

    return data?.map((row) => row.lesson_slug) ?? [];
  } catch {
    return [];
  }
}

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { path: pathSlug, module: moduleSlug } = await params;

  // Validate path and module exist
  const pathMeta = getPath(pathSlug);
  if (!pathMeta) notFound();

  const moduleMeta = getModule(pathSlug, moduleSlug);
  if (!moduleMeta) notFound();

  // Fetch course-scoped progress
  const completedLessons = await getModuleCompletedLessons(pathSlug, moduleSlug);

  // Calculate course progress
  const totalLessons = moduleMeta.lessons.length;
  const completedCount = completedLessons.length;
  const courseProgress =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  // Map lessons to sidebar data shape
  const lessons: CourseLessonRef[] = moduleMeta.lessons.map((l) => ({
    slug: l.slug,
    title: l.title,
    order: l.order,
  }));

  return (
    <CourseShell
      pathSlug={pathSlug}
      pathTitle={pathMeta.title}
      moduleSlug={moduleSlug}
      courseTitle={moduleMeta.title}
      lessons={lessons}
      completedLessons={completedLessons}
      courseProgress={courseProgress}
      totalLessons={totalLessons}
      completedCount={completedCount}
    >
      {children}
    </CourseShell>
  );
}
