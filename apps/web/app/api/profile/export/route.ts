import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/export
 *
 * GDPR-compliant data export endpoint.
 * Returns all user data as a downloadable JSON file.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Resolve the Supabase profile UUID from the Clerk ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkId)
      .is("deleted_at", null)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    const userId = profile.id;

    // Fetch all user data in parallel
    const [
      { data: lessonProgress },
      { data: moduleProgress },
      { data: pathProgress },
      { data: quizAttempts },
      { data: xpLog },
      { data: dailyActivity },
      { data: certificates },
      { data: userBadges },
      { data: badgeDefs },
      { data: userAchievements },
      { data: discussions },
      { data: events },
      { data: exerciseProgress },
      { data: labSessions },
      { data: skillScores },
      { data: projectProgress },
      { data: simulationAttempts },
      { data: notifications },
      { data: jobApplications },
      { data: activeTimeLog },
    ] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false }),
      supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false }),
      supabase
        .from("path_progress")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),
      supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("attempted_at", { ascending: false }),
      supabase
        .from("xp_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", userId)
        .order("activity_date", { ascending: false }),
      supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false }),
      supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false }),
      supabase
        .from("badge_definitions")
        .select("id, name, description, category, tier")
        .eq("is_active", true),
      supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false }),
      supabase
        .from("discussions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("exercise_progress")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false }),
      supabase
        .from("lab_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("skill_scores")
        .select("*")
        .eq("user_id", userId)
        .order("calculated_at", { ascending: false }),
      supabase
        .from("project_progress")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),
      supabase
        .from("simulation_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .order("applied_at", { ascending: false }),
      supabase
        .from("active_time_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    // Enrich badges with their definitions
    const badgeDefMap = new Map(
      (badgeDefs ?? []).map((d) => [d.id, d]),
    );

    const enrichedBadges = (userBadges ?? []).map((b) => {
      const def = badgeDefMap.get(b.badge_id);
      return {
        ...b,
        badge_name: def?.name ?? null,
        badge_description: def?.description ?? null,
        badge_category: def?.category ?? null,
        badge_tier: def?.tier ?? null,
      };
    });

    // Strip internal Clerk ID from the exported profile for privacy
    const { clerk_id: _clerkId, ...exportableProfile } = profile;

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        description:
          "Complete data export for GDPR compliance. Contains all personal data associated with your account.",
      },
      profile: exportableProfile,
      lesson_progress: lessonProgress ?? [],
      exercise_progress: exerciseProgress ?? [],
      module_progress: moduleProgress ?? [],
      path_progress: pathProgress ?? [],
      quiz_attempts: quizAttempts ?? [],
      xp_log: xpLog ?? [],
      daily_activity: dailyActivity ?? [],
      certificates: certificates ?? [],
      badges: enrichedBadges,
      achievements: userAchievements ?? [],
      discussions: discussions ?? [],
      events: events ?? [],
      lab_sessions: labSessions ?? [],
      skill_scores: skillScores ?? [],
      project_progress: projectProgress ?? [],
      simulation_attempts: simulationAttempts ?? [],
      notifications: notifications ?? [],
      job_applications: jobApplications ?? [],
      active_time_log: activeTimeLog ?? [],
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="my-data-export.json"',
      },
    });
  } catch (err) {
    console.error("GDPR data export error:", err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
