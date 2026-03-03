import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { getModulesForPath } from "@/lib/content";

export async function GET(request: NextRequest) {
  const pathSlug = request.nextUrl.searchParams.get("path");
  if (!pathSlug) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(null, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json(null, { status: 404 });
  }

  const supabase = createAdminClient();

  const [{ data: pathProgress }, { data: lessonProgress }] = await Promise.all([
    supabase
      .from("path_progress")
      .select("percentage, modules_total, modules_completed")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("lesson_slug, module_slug, status, started_at")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .order("started_at", { ascending: false, nullsFirst: false }),
  ]);

  const completedLessons = (lessonProgress ?? [])
    .filter((l) => l.status === "completed")
    .map((l) => l.lesson_slug);

  // Compute resume href: find first incomplete lesson in module order
  let resumeHref: string | null = null;
  const completedSet = new Set(completedLessons);
  const modules = getModulesForPath(pathSlug);

  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (!completedSet.has(lesson.slug)) {
        resumeHref = `/learn/${pathSlug}/${mod.slug}/${lesson.slug}`;
        break;
      }
    }
    if (resumeHref) break;
  }

  return NextResponse.json({
    percentage: pathProgress?.percentage ?? 0,
    modulesCompleted: pathProgress?.modules_completed ?? 0,
    modulesTotal: pathProgress?.modules_total ?? modules.length,
    completedLessons,
    resumeHref,
  });
}
