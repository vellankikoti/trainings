import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getAllPaths, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { PathCatalog, type CatalogPath } from "@/components/paths/PathCatalog";
import {
  SkillRoadmap,
  type RoadmapPath,
  type RoadmapModule,
} from "@/components/paths/SkillRoadmap";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "6 structured learning paths to take you from zero to production-ready DevOps engineer.",
};

async function getUserProgress(): Promise<{
  pathProgress: Map<string, number>;
  moduleProgress: Map<
    string,
    { percentage: number; lessonsCompleted: number }
  >;
}> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return { pathProgress: new Map(), moduleProgress: new Map() };

    const profileId = await getProfileId(clerkId);
    if (!profileId)
      return { pathProgress: new Map(), moduleProgress: new Map() };

    const supabase = createAdminClient();
    const [{ data: pathData }, { data: moduleData }] = await Promise.all([
      supabase
        .from("path_progress")
        .select("path_slug, percentage")
        .eq("user_id", profileId),
      supabase
        .from("module_progress")
        .select("path_slug, module_slug, percentage, lessons_completed")
        .eq("user_id", profileId),
    ]);

    const pathProgress = new Map<string, number>();
    for (const row of pathData ?? []) {
      pathProgress.set(row.path_slug, row.percentage);
    }

    const moduleProgress = new Map<
      string,
      { percentage: number; lessonsCompleted: number }
    >();
    for (const row of moduleData ?? []) {
      moduleProgress.set(`${row.path_slug}/${row.module_slug}`, {
        percentage: row.percentage,
        lessonsCompleted: row.lessons_completed,
      });
    }

    return { pathProgress, moduleProgress };
  } catch {
    return { pathProgress: new Map(), moduleProgress: new Map() };
  }
}

export default async function PathsPage() {
  const paths = getAllPaths();
  const { pathProgress, moduleProgress } = await getUserProgress();

  const catalogPaths: CatalogPath[] = paths.map((p) => {
    const modules = getModulesForPath(p.slug);
    const totalLessons = modules.reduce((sum, m) => sum + m.lessonsCount, 0);
    const userProgress = pathProgress.get(p.slug);

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

  // Build roadmap data with module-level progress
  const roadmapPaths: RoadmapPath[] = paths.map((p) => {
    const modules = getModulesForPath(p.slug);

    return {
      slug: p.slug,
      title: p.title,
      color: p.color,
      difficulty: p.difficulty,
      progress: pathProgress.get(p.slug) ?? 0,
      modules: modules.map((m): RoadmapModule => {
        const modProg = moduleProgress.get(`${p.slug}/${m.slug}`);
        let status: RoadmapModule["status"] = "not_started";
        if (modProg) {
          status = modProg.percentage === 100 ? "completed" : "in_progress";
        }
        return {
          slug: m.slug,
          title: m.title,
          lessonsCount: m.lessonsCount,
          completedLessons: modProg?.lessonsCompleted ?? 0,
          status,
        };
      }),
    };
  });

  const hasAnyProgress = roadmapPaths.some((p) => p.progress > 0);

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

      {/* Roadmap — only show if user has started learning */}
      {hasAnyProgress && (
        <div className="mt-10">
          <SkillRoadmap paths={roadmapPaths} />
        </div>
      )}

      <div className="mt-10">
        <PathCatalog paths={catalogPaths} />
      </div>
    </div>
  );
}
