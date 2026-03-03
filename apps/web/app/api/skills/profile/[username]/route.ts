import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateLevel, levelProgress } from "@/lib/levels";
import { getDomainLabel } from "@/lib/skills/domains";

/**
 * GET /api/skills/profile/[username]
 *
 * Public endpoint returning a user's skill profile — visible only
 * when the user has public_profile = true and is_discoverable = true.
 *
 * Returns: profile info, skill scores, badges, activity summary.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  if (!username || username.length < 1) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find the user by username — must be public
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("public_profile", true)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch skill scores, badges, and activity stats in parallel
  const [{ data: skillScores }, { data: badges }, { data: activityStats }, { count: labsCount }] =
    await Promise.all([
      supabase
        .from("skill_scores")
        .select("*")
        .eq("user_id", profile.id)
        .order("composite_score", { ascending: false }),
      supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", profile.id)
        .order("earned_at", { ascending: false }),
      supabase
        .from("daily_activity")
        .select("activity_date, xp_earned, lessons_completed")
        .eq("user_id", profile.id)
        .order("activity_date", { ascending: false })
        .limit(90),
      supabase
        .from("lab_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("status", "completed"),
    ]);

  // Fetch badge definitions for name/icon lookup
  const { data: badgeDefs } = await supabase
    .from("badge_definitions")
    .select("id, name, description, icon, category, tier")
    .eq("is_active", true);
  const badgeDefMap = new Map(
    (badgeDefs ?? []).map((d) => [d.id, d]),
  );

  // Completion stats
  const [{ count: lessonsCount }, { count: modulesCount }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("status", "completed"),
    supabase
      .from("module_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("percentage", 100),
  ]);

  const levelObj = calculateLevel(profile.total_xp);
  const lvlProgress = levelProgress(profile.total_xp);

  // Build response
  const response = {
    profile: {
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      githubUsername: profile.github_username,
      level: levelObj.level,
      levelTitle: levelObj.title,
      levelProgress: lvlProgress,
      totalXp: profile.total_xp,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      locationCity: profile.is_discoverable ? profile.location_city : null,
      locationCountry: profile.is_discoverable ? profile.location_country : null,
      availability: profile.is_discoverable ? profile.availability : null,
      memberSince: profile.created_at,
    },
    skills: (skillScores ?? []).map((s) => ({
      domain: s.domain,
      domainLabel: getDomainLabel(s.domain),
      compositeScore: s.composite_score,
      theoryScore: s.theory_score,
      labScore: s.lab_score,
      incidentScore: s.incident_score,
      quizScore: s.quiz_score,
      consistencyScore: s.consistency_score,
      percentile: s.percentile,
    })),
    badges: (badges ?? []).map((b) => {
      const def = badgeDefMap.get(b.badge_id);
      return {
        badgeId: b.badge_id,
        name: def?.name ?? b.badge_id,
        description: def?.description ?? "",
        icon: def?.icon ?? "award",
        category: def?.category ?? "special",
        tier: def?.tier ?? "bronze",
        earnedAt: b.earned_at,
      };
    }),
    stats: {
      lessonsCompleted: lessonsCount ?? 0,
      modulesCompleted: modulesCount ?? 0,
      labsCompleted: labsCount ?? 0,
      activeDaysLast90: (activityStats ?? []).length,
      totalXpLast90: (activityStats ?? []).reduce(
        (sum, a) => sum + a.xp_earned,
        0,
      ),
    },
  };

  return NextResponse.json(response);
}
