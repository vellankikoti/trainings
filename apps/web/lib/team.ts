import { createAdminClient } from "@/lib/supabase/server";

export interface TeamMember {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  email: string | null;
  level: number;
  totalXp: number;
  lessonsCompleted: number;
  joinedAt: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembersThisWeek: number;
  totalLessonsCompleted: number;
  averageProgress: number;
  topModule: string | null;
}

/**
 * Get all team members for a team admin.
 * Team members are identified by sharing the same subscription group.
 */
export async function getTeamMembers(
  adminUserId: string,
): Promise<TeamMember[]> {
  const supabase = createAdminClient();

  // Get the admin's subscription to find the team
  const { data: adminSub } = (await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", adminUserId)
    .eq("plan", "team")
    .single()) as any;

  if (!adminSub?.stripe_customer_id) {
    return [];
  }

  // Get all team members (users sharing the same Stripe customer)
  const { data: teamSubs } = (await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", adminSub.stripe_customer_id)) as any;

  if (!teamSubs || teamSubs.length === 0) {
    return [];
  }

  const userIds = teamSubs.map((s: any) => s.user_id);

  // Get profiles for team members
  const { data: profiles } = (await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, level, total_xp, created_at")
    .in("id", userIds)) as any;

  if (!profiles) return [];

  // Get lesson completion counts
  const { data: progress } = (await supabase
    .from("lesson_progress")
    .select("user_id")
    .in("user_id", userIds)
    .eq("status", "completed")) as any;

  const completionCounts = new Map<string, number>();
  for (const p of progress || []) {
    completionCounts.set(p.user_id, (completionCounts.get(p.user_id) || 0) + 1);
  }

  return profiles.map((p: any) => ({
    id: p.id,
    displayName: p.display_name,
    username: p.username,
    avatarUrl: p.avatar_url,
    email: null, // Not exposed for privacy
    level: p.level ?? 1,
    totalXp: p.total_xp ?? 0,
    lessonsCompleted: completionCounts.get(p.id) || 0,
    joinedAt: p.created_at,
  }));
}

/**
 * Get aggregate stats for the team.
 */
export async function getTeamStats(
  adminUserId: string,
): Promise<TeamStats> {
  const members = await getTeamMembers(adminUserId);

  const totalMembers = members.length;
  const totalLessonsCompleted = members.reduce(
    (sum, m) => sum + m.lessonsCompleted,
    0,
  );
  const averageProgress =
    totalMembers > 0 ? totalLessonsCompleted / totalMembers : 0;

  // Count active members this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const supabase = createAdminClient();
  const userIds = members.map((m) => m.id);

  const { count: activeMembersThisWeek } = await supabase
    .from("daily_activity")
    .select("user_id", { count: "exact", head: true })
    .in("user_id", userIds)
    .gte("date", oneWeekAgo.toISOString());

  return {
    totalMembers,
    activeMembersThisWeek: activeMembersThisWeek ?? 0,
    totalLessonsCompleted,
    averageProgress: Math.round(averageProgress * 10) / 10,
    topModule: null, // Can be computed from module_progress in future
  };
}
