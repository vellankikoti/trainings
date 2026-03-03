import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getAllPaths, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { PathCatalog, type CatalogPath } from "@/components/paths/PathCatalog";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "6 structured learning paths to take you from zero to production-ready DevOps engineer.",
};

async function getUserPathProgress(): Promise<Map<string, number>> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new Map();

    const profileId = await getProfileId(clerkId);
    if (!profileId) return new Map();

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("path_progress")
      .select("path_slug, percentage")
      .eq("user_id", profileId);

    const map = new Map<string, number>();
    for (const row of data ?? []) {
      map.set(row.path_slug, row.percentage);
    }
    return map;
  } catch {
    return new Map();
  }
}

export default async function PathsPage() {
  const paths = getAllPaths();
  const progressMap = await getUserPathProgress();

  const catalogPaths: CatalogPath[] = paths.map((p) => {
    const modules = getModulesForPath(p.slug);
    const totalLessons = modules.reduce((sum, m) => sum + m.lessonsCount, 0);
    const userProgress = progressMap.get(p.slug);

    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      color: p.color,
      moduleCount: modules.length,
      lessonCount: totalLessons,
      estimatedHours: p.estimatedHours,
      progress: userProgress !== undefined ? userProgress : null,
    };
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Learning Paths</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {paths.length} structured paths designed to take you from complete
          beginner to production-ready DevOps engineer. Choose your starting
          point based on your experience level.
        </p>
      </div>
      <div className="mt-10">
        <PathCatalog paths={catalogPaths} />
      </div>
    </div>
  );
}
