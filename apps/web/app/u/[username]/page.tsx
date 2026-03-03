import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateLevel, levelProgress } from "@/lib/levels";
import { getDomainLabel } from "@/lib/skills/domains";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("username", username)
    .eq("public_profile", true)
    .single();

  if (!profile) return { title: "Profile Not Found" };

  return {
    title: `${profile.display_name || username} — Skill Profile`,
    description: `View ${profile.display_name || username}'s skills, badges, and learning progress.`,
  };
}

export default async function PublicSkillProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = createAdminClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("public_profile", true)
    .single();

  if (!profile) notFound();

  // Fetch all profile data in parallel
  const [
    { data: skillScores },
    { data: userBadges },
    { data: badgeDefs },
    { data: activityData },
    { count: lessonsCount },
    { count: modulesCount },
    { count: labsCount },
  ] = await Promise.all([
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
      .from("badge_definitions")
      .select("id, name, description, icon, category, tier")
      .eq("is_active", true),
    supabase
      .from("daily_activity")
      .select("activity_date, xp_earned")
      .eq("user_id", profile.id)
      .order("activity_date", { ascending: false })
      .limit(90),
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
    supabase
      .from("lab_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("status", "completed"),
  ]);

  const levelObj = calculateLevel(profile.total_xp);
  const lvlProgress = levelProgress(profile.total_xp);

  const badgeDefMap = new Map(
    (badgeDefs ?? []).map((d) => [d.id, d]),
  );

  const badges = (userBadges ?? []).map((b) => {
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
  });

  const visibility = profile.profile_visibility || "full";
  const skills = skillScores ?? [];
  const activity = activityData ?? [];
  const activeDays = activity.length;
  const xpLast90 = activity.reduce((sum, a) => sum + a.xp_earned, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* ── Profile Header ── */}
      <div className="flex items-start gap-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${profile.display_name || username}'s avatar`}
            className="h-24 w-24 rounded-full border-2 border-border"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {(profile.display_name || username).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">
            {profile.display_name || username}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <GitHubIcon />
                {profile.github_username}
              </a>
            )}
            {profile.is_discoverable && profile.location_city && (
              <span className="flex items-center gap-1">
                <MapPinIcon />
                {profile.location_city}
                {profile.location_country ? `, ${profile.location_country}` : ""}
              </span>
            )}
            {profile.is_discoverable && profile.availability !== "not_specified" && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {profile.availability === "open" ? "Open to opportunities" : profile.availability}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={levelObj.title} value={`Lv ${levelObj.level}`}>
          <ProgressBar
            value={lvlProgress}
            size="sm"
            ariaLabel={`Level ${levelObj.level} progress`}
          />
        </StatCard>
        <StatCard
          label="Total XP"
          value={profile.total_xp.toLocaleString()}
        />
        <StatCard label="Day Streak" value={profile.current_streak} />
        <StatCard label="Lessons Done" value={lessonsCount ?? 0} />
      </div>

      {/* ── Skill Scores (hidden in "minimal" visibility) ── */}
      {visibility !== "minimal" && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Skill Scores</h2>
          {skills.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.domain}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {getDomainLabel(skill.domain)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getScoreLabel(skill.composite_score)}
                        {skill.percentile != null && (
                          <> &middot; Top {100 - skill.percentile}%</>
                        )}
                      </p>
                    </div>
                    <span className="text-2xl font-bold tabular-nums">
                      {Math.round(skill.composite_score)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all ${getScoreColor(skill.composite_score)}`}
                      style={{
                        width: `${Math.min(100, skill.composite_score)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>Theory: {Math.round(skill.theory_score)}</span>
                    <span>Labs: {Math.round(skill.lab_score)}</span>
                    <span>Quiz: {Math.round(skill.quiz_score)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No skill scores yet. Start learning to build your profile!
            </p>
          )}
        </section>
      )}

      {/* ── Badges (hidden in "minimal" visibility) ── */}
      {visibility !== "minimal" && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Badges{badges.length > 0 && ` (${badges.length})`}
          </h2>
          {badges.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {badges.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${getTierBg(badge.tier)}`}
                  >
                    <BadgeIcon name={badge.icon} />
                  </div>
                  <p className="mt-2 text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No badges earned yet.
            </p>
          )}
        </section>
      )}

      {/* ── Activity Summary (only in "full" visibility) ── */}
      {visibility === "full" && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Activity (Last 90 Days)</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label="Active Days" value={activeDays} />
            <MiniStat label="XP Earned" value={xpLast90.toLocaleString()} />
            <MiniStat label="Courses Done" value={modulesCount ?? 0} />
            <MiniStat label="Labs Done" value={labsCount ?? 0} />
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <div className="mt-10 text-sm text-muted-foreground">
        Member since{" "}
        {new Date(profile.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })}
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value: string | number;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Beginner";
  return "Getting Started";
}

function getTierBg(tier: string): string {
  switch (tier) {
    case "platinum":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    case "gold":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "silver":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BadgeIcon({ name }: { name: string }) {
  const s = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icons: Record<string, React.ReactNode> = {
    flame: <svg {...s}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    zap: <svg {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    "book-open": <svg {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    terminal: <svg {...s}><polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" /></svg>,
    award: <svg {...s}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
    star: <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    shield: <svg {...s}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>,
    trophy: <svg {...s}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
    target: <svg {...s}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    "check-circle": <svg {...s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
    clock: <svg {...s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    code: <svg {...s}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    "git-branch": <svg {...s}><line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>,
    rocket: <svg {...s}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
  };

  return <>{icons[name] ?? icons.award}</>;
}
