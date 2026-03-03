import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPath, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { LearningShell } from "@/components/learn/LearningShell";
import type { SidebarModule } from "@/components/learn/LearningSidebar";

interface PathLayoutProps {
  children: React.ReactNode;
  params: Promise<{ path: string }>;
}

/**
 * Fetch completed lesson slugs for this path from the database.
 * Returns an empty array if the user has no progress or if auth fails.
 */
async function getCompletedLessons(
  pathSlug: string,
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
      .eq("status", "completed");

    return data?.map((row) => row.lesson_slug) ?? [];
  } catch {
    return [];
  }
}

export default async function PathLayout({ children, params }: PathLayoutProps) {
  const { path: pathSlug } = await params;

  // Fetch path metadata and modules (file system, sync)
  const pathMeta = getPath(pathSlug);
  if (!pathMeta) notFound();

  const modules = getModulesForPath(pathSlug);

  // Fetch user progress (database, async)
  const completedLessons = await getCompletedLessons(pathSlug);

  // Calculate overall progress
  const totalLessons = modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0,
  );
  const courseProgress =
    totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

  // Map to sidebar data shape
  const sidebarModules: SidebarModule[] = modules.map((mod) => ({
    slug: mod.slug,
    title: mod.title,
    order: mod.order,
    lessons: mod.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      order: lesson.order,
    })),
  }));

  return (
    <LearningShell
      pathSlug={pathSlug}
      pathTitle={pathMeta.title}
      modules={sidebarModules}
      completedLessons={completedLessons}
      courseProgress={courseProgress}
    >
      {children}
    </LearningShell>
  );
}
