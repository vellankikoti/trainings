/**
 * Skill Score Calculation Engine
 *
 * Computes per-domain composite scores using the formula:
 *   composite = (theory×0.15 + lab×0.30 + incident×0.30 + quiz×0.15 + consistency×0.10) × decay
 *
 * Each component is 0–100. Decay applies after 90 days of domain inactivity.
 *
 * Schema alignment:
 *   - lab_sessions: status='completed' means passed, tier=1/2/3, hints_used, score, lab_id encodes domain
 *   - simulation_attempts: total_score (0–100), simulation_id references simulation_definitions.category
 *   - quiz_attempts: quiz_id starts with path-slug, score/max_score
 */

import { createAdminClient } from "@/lib/supabase/server";
import { PATH_TO_DOMAIN, SKILL_DOMAINS } from "./domains";

// ── Weights ──────────────────────────────────────────────────────────────────

const WEIGHTS = {
  theory: 0.15,
  lab: 0.30,
  incident: 0.30,
  quiz: 0.15,
  consistency: 0.10,
} as const;

// ── Types for query results ──────────────────────────────────────────────────

interface LessonRow {
  path_slug: string;
  status: string;
  completed_at: string | null;
}

interface QuizRow {
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  attempted_at: string;
}

interface LabRow {
  lab_id: string;
  tier: number;
  status: string;
  hints_used: number;
  score: number | null;
  completed_at: string | null;
}

interface SimRow {
  simulation_id: string;
  total_score: number | null;
  resolved_at: string | null;
}

interface SimDefRow {
  id: string;
  category: string;
}

interface ActivityRow {
  activity_date: string;
}

// ── Category → Domain mapping for simulations ────────────────────────────────

const SIM_CATEGORY_TO_DOMAIN: Record<string, string> = {
  container: "containers",
  resource: "kubernetes",
  networking: "networking",
  cicd: "cicd",
  security: "linux",
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Recalculate all skill scores for a user. Call after significant activity
 * (lesson completion, lab session, quiz, simulation).
 */
export async function recalculateSkillScores(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000)
    .toISOString()
    .split("T")[0];

  // Fetch all data needed in parallel
  const [
    { data: lessonProgress },
    { data: quizAttempts },
    { data: labSessions },
    { data: simAttempts },
    { data: simDefs },
    { data: dailyActivity },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("path_slug, status, completed_at")
      .eq("user_id", userId),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, score, total_questions, correct_answers, attempted_at")
      .eq("user_id", userId),
    supabase
      .from("lab_sessions")
      .select("lab_id, tier, status, hints_used, score, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("simulation_attempts")
      .select("simulation_id, total_score, resolved_at")
      .eq("user_id", userId)
      .eq("status", "resolved"),
    supabase
      .from("simulation_definitions")
      .select("id, category"),
    supabase
      .from("daily_activity")
      .select("activity_date")
      .eq("user_id", userId)
      .gte("activity_date", ninetyDaysAgo),
    supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", userId)
      .single(),
  ]);

  const lessons: LessonRow[] = lessonProgress ?? [];
  const quizzes: QuizRow[] = quizAttempts ?? [];
  const labs: LabRow[] = labSessions ?? [];
  const sims: SimRow[] = simAttempts ?? [];
  const simDefinitions: SimDefRow[] = simDefs ?? [];
  const activity: ActivityRow[] = dailyActivity ?? [];
  const streak = profile?.current_streak ?? 0;

  // Build sim_id → domain lookup
  const simDomainMap = new Map<string, string>();
  for (const def of simDefinitions) {
    const domain = SIM_CATEGORY_TO_DOMAIN[def.category] ?? "troubleshooting";
    simDomainMap.set(def.id, domain);
  }

  // Process each domain
  for (const domain of SKILL_DOMAINS) {
    const pathSlugs = Object.entries(PATH_TO_DOMAIN)
      .filter(([, d]) => d === domain.id)
      .map(([slug]) => slug);

    // Filter data for this domain
    const domainLessons = lessons.filter((l) =>
      pathSlugs.includes(l.path_slug),
    );

    const domainQuizzes = quizzes.filter((q) => {
      // Quiz IDs may start with path-slug or module-slug
      for (const slug of pathSlugs) {
        if (q.quiz_id.startsWith(slug) || q.quiz_id.includes(slug)) return true;
      }
      return q.quiz_id.includes(domain.id);
    });

    // Labs: lab_id convention is "{domain}/{lab-name}" or contains the path slug
    const domainLabs = labs.filter((l) =>
      pathSlugs.some((slug) => l.lab_id.startsWith(slug)) ||
      l.lab_id.startsWith(domain.id),
    );

    // Simulations: use the sim definition category → domain mapping
    const domainSims = sims.filter((s) => {
      const simDomain = simDomainMap.get(s.simulation_id);
      if (domain.id === "troubleshooting") {
        // Troubleshooting is fed by ALL simulations
        return true;
      }
      return simDomain === domain.id;
    });

    // Skip if no activity in this domain
    const hasActivity =
      domainLessons.length > 0 ||
      domainQuizzes.length > 0 ||
      domainLabs.length > 0 ||
      domainSims.length > 0;

    if (!hasActivity) continue;

    // Calculate each component score
    const theoryScore = calculateTheoryScore(domainLessons);
    const labScore = calculateLabScore(domainLabs);
    const incidentScore = calculateIncidentScore(domainSims);
    const quizScore = calculateQuizScore(domainQuizzes);

    const allDates = collectDates(
      domainLessons,
      domainLabs,
      domainSims,
      domainQuizzes,
    );
    const lastActivity = allDates.length > 0 ? allDates[0] : null;

    const consistencyScore = calculateConsistencyScore(
      activity,
      streak,
      lastActivity,
    );

    // Decay factor
    const decayFactor = calculateDecay(lastActivity, now);
    const decayApplied = decayFactor < 1.0;

    // Composite score
    const rawComposite =
      theoryScore * WEIGHTS.theory +
      labScore * WEIGHTS.lab +
      incidentScore * WEIGHTS.incident +
      quizScore * WEIGHTS.quiz +
      consistencyScore * WEIGHTS.consistency;

    const compositeScore = round2(
      Math.min(100, Math.max(0, rawComposite * decayFactor)),
    );

    // Upsert into skill_scores
    const { data: existing } = await supabase
      .from("skill_scores")
      .select("id")
      .eq("user_id", userId)
      .eq("domain", domain.id)
      .single();

    const scoreRow = {
      user_id: userId,
      domain: domain.id,
      theory_score: round2(theoryScore),
      lab_score: round2(labScore),
      incident_score: round2(incidentScore),
      quiz_score: round2(quizScore),
      consistency_score: round2(consistencyScore),
      composite_score: compositeScore,
      decay_applied: decayApplied,
      last_activity_at: lastActivity?.toISOString() ?? null,
    };

    if (existing) {
      await supabase
        .from("skill_scores")
        .update(scoreRow)
        .eq("id", existing.id);
    } else {
      await supabase.from("skill_scores").insert(scoreRow);
    }
  }
}

/**
 * Recalculate a single domain score (convenience wrapper).
 */
export async function recalculateDomainScore(
  userId: string,
  domain: string,
): Promise<number> {
  await recalculateSkillScores(userId);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skill_scores")
    .select("composite_score")
    .eq("user_id", userId)
    .eq("domain", domain)
    .single();

  return data?.composite_score ?? 0;
}

// ── Component Score Calculations ─────────────────────────────────────────────

/**
 * Theory score: based on lesson completion ratio.
 * 100 = all lessons completed, 0 = none started.
 */
function calculateTheoryScore(lessons: LessonRow[]): number {
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((l) => l.status === "completed").length;
  return (completed / lessons.length) * 100;
}

/**
 * Lab score: weighted by difficulty tier with hint penalty.
 *
 * Tier multipliers: T1=1.0, T2=1.5, T3=2.0
 * Hint penalty: -15% per hint used (floor 0)
 * Uses lab_sessions.score if available, otherwise derives from status.
 */
function calculateLabScore(labs: LabRow[]): number {
  if (labs.length === 0) return 0;

  const TIER_WEIGHTS: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 2.0 };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const lab of labs) {
    const weight = TIER_WEIGHTS[lab.tier] ?? 1.0;
    totalWeight += weight;

    // If score is stored directly (0-100), use it
    if (lab.score != null && lab.score > 0) {
      weightedScore += (lab.score / 100) * weight;
      continue;
    }

    // Otherwise derive: completed = passed, apply hint penalty
    const hintPenalty = Math.max(0, 1 - lab.hints_used * 0.15);
    weightedScore += hintPenalty * weight;
  }

  if (totalWeight === 0) return 0;
  return (weightedScore / totalWeight) * 100;
}

/**
 * Incident/simulation score: average of top 70% of scores.
 * Allows for learning curve by discarding worst 30%.
 */
function calculateIncidentScore(sims: SimRow[]): number {
  if (sims.length === 0) return 0;

  const scores = sims
    .map((s) => s.total_score ?? 0)
    .sort((a, b) => b - a);

  const topCount = Math.max(1, Math.ceil(scores.length * 0.7));
  const topScores = scores.slice(0, topCount);

  return Math.min(
    100,
    topScores.reduce((sum, s) => sum + s, 0) / topScores.length,
  );
}

/**
 * Quiz score: average of all quiz scores in the domain.
 * quiz_attempts.score is already a percentage (0–100).
 */
function calculateQuizScore(quizzes: QuizRow[]): number {
  if (quizzes.length === 0) return 0;

  const totalScore = quizzes.reduce((sum, q) => sum + q.score, 0);
  return totalScore / quizzes.length;
}

/**
 * Consistency score: multi-factor based on activity patterns.
 *
 * activity_frequency = min(1.0, days_active_last_30 / 15)   → 15 days = max
 * recency_weight = max(0, 1.0 - days_since_last / 90)       → 90-day decay
 * streak_factor = min(1.0, current_streak / 30)              → 30-day streak = max
 *
 * consistency = (frequency×0.4 + recency×0.4 + streak×0.2) × 100
 */
function calculateConsistencyScore(
  recentActivity: ActivityRow[],
  currentStreak: number,
  lastDomainActivity: Date | null,
): number {
  const now = new Date();

  // Days active in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const recentDays = recentActivity.filter(
    (a) => new Date(a.activity_date) >= thirtyDaysAgo,
  ).length;
  const activityFrequency = Math.min(1.0, recentDays / 15);

  // Recency
  let recencyWeight = 0;
  if (lastDomainActivity) {
    const daysSinceLast = Math.floor(
      (now.getTime() - lastDomainActivity.getTime()) / 86400000,
    );
    recencyWeight = Math.max(0, 1.0 - daysSinceLast / 90);
  }

  // Streak factor
  const streakFactor = Math.min(1.0, currentStreak / 30);

  return (activityFrequency * 0.4 + recencyWeight * 0.4 + streakFactor * 0.2) * 100;
}

// ── Decay ────────────────────────────────────────────────────────────────────

/**
 * Decay factor: applied when inactive > 90 days in a domain.
 * 2% per week beyond 90 days, minimum 50%.
 */
function calculateDecay(lastActivity: Date | null, now: Date): number {
  if (!lastActivity) return 1.0;

  const daysSinceLast = Math.floor(
    (now.getTime() - lastActivity.getTime()) / 86400000,
  );

  if (daysSinceLast <= 90) return 1.0;

  const weeksInactive = (daysSinceLast - 90) / 7;
  return Math.max(0.5, 1.0 - weeksInactive * 0.02);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Collect and sort all completion dates (most recent first). */
function collectDates(
  lessons: LessonRow[],
  labs: LabRow[],
  sims: SimRow[],
  quizzes: QuizRow[],
): Date[] {
  const dates: Date[] = [];

  for (const l of lessons) {
    if (l.completed_at) dates.push(new Date(l.completed_at));
  }
  for (const l of labs) {
    if (l.completed_at) dates.push(new Date(l.completed_at));
  }
  for (const s of sims) {
    if (s.resolved_at) dates.push(new Date(s.resolved_at));
  }
  for (const q of quizzes) {
    if (q.attempted_at) dates.push(new Date(q.attempted_at));
  }

  dates.sort((a, b) => b.getTime() - a.getTime());
  return dates;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
