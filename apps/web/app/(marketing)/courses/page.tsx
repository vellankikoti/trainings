import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getAllPaths, getModulesForPath, type ModuleMeta } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { CourseCatalog } from "@/components/courses/CourseCatalog";

export const metadata: Metadata = {
  title: "All Courses",
  description:
    "Browse every course in our DevOps curriculum. Start anywhere — no prerequisites enforced.",
};

/* ─── Data types ────────────────────────────────────────────────────────────── */

export interface CatalogCourse {
  slug: string;
  pathSlug: string;
  pathTitle: string;
  pathColor: string;
  title: string;
  description: string;
  order: number;
  lessonsCount: number;
  estimatedHours: number;
  difficulty: string;
  /** Completion percentage for the authenticated user (null if no progress / signed out) */
  progress: number | null;
}

/* ─── Server data fetching ─────────────────────────────────────────────────── */

async function getUserModuleProgress(): Promise<
  Map<string, number>
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new Map();

    const profileId = await getProfileId(clerkId);
    if (!profileId) return new Map();

    const supabase = createAdminClient();

    // Fetch lesson-level progress grouped by module
    const { data } = await supabase
      .from("lesson_progress")
      .select("path_slug, module_slug, status")
      .eq("user_id", profileId)
      .eq("status", "completed");

    // Build a map of "pathSlug/moduleSlug" → completed lesson count
    const completedMap = new Map<string, number>();
    for (const row of data ?? []) {
      const key = `${row.path_slug}/${row.module_slug}`;
      completedMap.set(key, (completedMap.get(key) ?? 0) + 1);
    }
    return completedMap;
  } catch {
    return new Map();
  }
}

export default async function CoursesPage() {
  const paths = getAllPaths();
  const completedMap = await getUserModuleProgress();

  const courses: CatalogCourse[] = [];

  for (const p of paths) {
    const modules = getModulesForPath(p.slug);
    for (const mod of modules) {
      const key = `${p.slug}/${mod.slug}`;
      const completedCount = completedMap.get(key) ?? 0;
      const progress =
        completedCount > 0 && mod.lessonsCount > 0
          ? Math.round((completedCount / mod.lessonsCount) * 100)
          : null;

      courses.push({
        slug: mod.slug,
        pathSlug: p.slug,
        pathTitle: p.title,
        pathColor: p.color,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        lessonsCount: mod.lessonsCount,
        estimatedHours: mod.estimatedHours,
        difficulty: p.difficulty,
        progress,
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          All Courses
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {courses.length} courses across {paths.length} learning paths. Start
          anywhere — learn in any order you prefer.
        </p>
      </div>

      {/* Catalog */}
      <div className="mt-12">
        <CourseCatalog courses={courses} />
      </div>
    </div>
  );
}
