import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthContext, AuthError } from "@/lib/auth";
import { calculateLevel } from "@/lib/levels";
import { getDomainLabel } from "@/lib/skills/domains";
import { CareerProfilePDF } from "./career-pdf";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    const [
      { data: skillScores },
      { data: userBadges },
      { data: badgeDefs },
      { count: lessonsCount },
      { count: modulesCount },
      { count: labsCount },
      { count: quizCount },
      { data: pathProgress },
    ] = await Promise.all([
      supabase
        .from("skill_scores")
        .select("domain, composite_score, theory_score, lab_score, quiz_score, percentile")
        .eq("user_id", ctx.userId)
        .order("composite_score", { ascending: false }),
      supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", ctx.userId)
        .order("earned_at", { ascending: false }),
      supabase
        .from("badge_definitions")
        .select("id, name, tier")
        .eq("is_active", true),
      supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("status", "completed"),
      supabase
        .from("module_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("percentage", 100),
      supabase
        .from("lab_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("status", "completed"),
      supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId),
      supabase
        .from("path_progress")
        .select("path_slug, modules_completed, modules_total, percentage")
        .eq("user_id", ctx.userId)
        .gt("percentage", 0),
    ]);

    const levelObj = calculateLevel(profile.total_xp);
    const badgeDefMap = new Map(
      (badgeDefs ?? []).map((d) => [d.id, d]),
    );

    const badges = (userBadges ?? []).map((b) => {
      const def = badgeDefMap.get(b.badge_id);
      return {
        name: def?.name ?? b.badge_id,
        tier: def?.tier ?? "bronze",
        earnedAt: b.earned_at,
      };
    });

    const skills = (skillScores ?? []).map((s) => ({
      domain: getDomainLabel(s.domain),
      compositeScore: Math.round(s.composite_score),
      theoryScore: Math.round(s.theory_score),
      labScore: Math.round(s.lab_score),
      quizScore: Math.round(s.quiz_score),
      percentile: s.percentile,
    }));

    const paths = (pathProgress ?? []).map((p) => ({
      pathSlug: p.path_slug,
      completed: p.modules_completed,
      total: p.modules_total,
      percentage: p.percentage,
    }));

    const pdfData = {
      displayName: profile.display_name || profile.username || "Learner",
      username: profile.username,
      bio: profile.bio,
      locationCity: profile.location_city,
      locationCountry: profile.location_country,
      githubUsername: profile.github_username,
      level: levelObj.level,
      levelTitle: levelObj.title,
      totalXp: profile.total_xp,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      memberSince: profile.created_at,
      lessonsCompleted: lessonsCount ?? 0,
      modulesCompleted: modulesCount ?? 0,
      labsCompleted: labsCount ?? 0,
      quizzesAttempted: quizCount ?? 0,
      skills,
      badges,
      paths,
    };

    const buffer = await renderToBuffer(CareerProfilePDF(pdfData));
    const uint8 = new Uint8Array(buffer);

    const filename = `${profile.username || "profile"}-career-profile.pdf`;
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
