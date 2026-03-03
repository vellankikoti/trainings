/**
 * Leaderboard queries using materialized views.
 *
 * The materialized views (mv_global_leaderboard, mv_domain_leaderboard)
 * are refreshed periodically via refresh_materialized_views().
 * Between refreshes, data may be slightly stale but queries are fast.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getDomainLabel } from "@/lib/skills/domains";

// ── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  rank: number;
}

export interface GlobalLeaderboardEntry extends LeaderboardEntry {
  currentStreak: number;
  longestStreak: number;
  badgeCount: number;
  lessonsCompleted: number;
}

export interface DomainLeaderboardEntry extends LeaderboardEntry {
  domain: string;
  domainLabel: string;
  compositeScore: number;
  theoryScore: number;
  labScore: number;
  quizScore: number;
  percentile: number | null;
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get global leaderboard (by total XP).
 * Falls back to direct query if materialized view doesn't exist yet.
 */
export async function getGlobalLeaderboard(
  limit = 50,
): Promise<GlobalLeaderboardEntry[]> {
  const supabase = createAdminClient();

  // Try materialized view first
  const { data, error } = await supabase
    .from("mv_global_leaderboard" as never)
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data) {
    // Fallback: direct query
    const { data: fallback } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, current_level, total_xp, current_streak, longest_streak")
      .eq("public_profile", true)
      .gt("total_xp", 0)
      .order("total_xp", { ascending: false })
      .limit(limit);

    return (fallback ?? []).map((p, i) => ({
      userId: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      level: p.current_level,
      totalXp: p.total_xp,
      currentStreak: p.current_streak,
      longestStreak: p.longest_streak,
      badgeCount: 0,
      lessonsCompleted: 0,
      rank: i + 1,
    }));
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    userId: row.user_id as string,
    username: row.username as string | null,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    level: row.current_level as number,
    totalXp: row.total_xp as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    badgeCount: row.badge_count as number,
    lessonsCompleted: row.lessons_completed as number,
    rank: row.rank as number,
  }));
}

/**
 * Get domain leaderboard (by composite score).
 */
export async function getDomainLeaderboard(
  domain: string,
  limit = 50,
): Promise<DomainLeaderboardEntry[]> {
  const supabase = createAdminClient();

  // Try materialized view first
  const { data, error } = await supabase
    .from("mv_domain_leaderboard" as never)
    .select("*")
    .eq("domain", domain)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data) {
    // Fallback: direct query
    const { data: fallback } = await supabase
      .from("skill_scores")
      .select("user_id, domain, composite_score, theory_score, lab_score, quiz_score, percentile")
      .eq("domain", domain)
      .gt("composite_score", 0)
      .order("composite_score", { ascending: false })
      .limit(limit);

    return (fallback ?? []).map((s, i) => ({
      userId: s.user_id,
      username: null,
      displayName: null,
      avatarUrl: null,
      level: 0,
      totalXp: 0,
      rank: i + 1,
      domain: s.domain,
      domainLabel: getDomainLabel(s.domain),
      compositeScore: s.composite_score,
      theoryScore: s.theory_score,
      labScore: s.lab_score,
      quizScore: s.quiz_score,
      percentile: s.percentile,
    }));
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    userId: row.user_id as string,
    username: row.username as string | null,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    level: row.current_level as number,
    totalXp: row.total_xp as number,
    rank: row.rank as number,
    domain: row.domain as string,
    domainLabel: getDomainLabel(row.domain as string),
    compositeScore: row.composite_score as number,
    theoryScore: row.theory_score as number,
    labScore: row.lab_score as number,
    quizScore: row.quiz_score as number,
    percentile: row.percentile as number | null,
  }));
}

/**
 * Get available domains for leaderboard filtering.
 */
export async function getLeaderboardDomains(): Promise<
  Array<{ domain: string; label: string; userCount: number }>
> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skill_scores")
    .select("domain")
    .gt("composite_score", 0);

  const domainCounts = new Map<string, number>();
  for (const row of data ?? []) {
    domainCounts.set(row.domain, (domainCounts.get(row.domain) ?? 0) + 1);
  }

  return Array.from(domainCounts.entries())
    .map(([domain, count]) => ({
      domain,
      label: getDomainLabel(domain),
      userCount: count,
    }))
    .sort((a, b) => b.userCount - a.userCount);
}

// ── Admin functions ──────────────────────────────────────────────────────────

/**
 * Trigger percentile recalculation (call nightly or after bulk score updates).
 */
export async function triggerPercentileRecalculation(): Promise<void> {
  const supabase = createAdminClient();
  await supabase.rpc("recalculate_skill_percentiles" as never);
}

/**
 * Refresh all materialized views.
 */
export async function triggerViewRefresh(): Promise<void> {
  const supabase = createAdminClient();
  await supabase.rpc("refresh_materialized_views" as never);
}
