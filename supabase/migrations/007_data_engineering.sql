-- =============================================
-- Migration 007: Data Engineering
-- DE-001: Events optimization & indexes
-- DE-002: Materialized views for analytics
-- DE-003: Skill percentile calculation
-- =============================================

-- ─── DE-001: Events Table Optimization ────────────────────────────────────────

-- Better indexes for event analytics queries
CREATE INDEX IF NOT EXISTS idx_events_type_created
    ON events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_type_created
    ON events(user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_session
    ON events(session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

-- Active time log indexes
CREATE INDEX IF NOT EXISTS idx_active_time_user_entity
    ON active_time_log(user_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_active_time_user_created
    ON active_time_log(user_id, created_at DESC);

-- Events retention cleanup function (removes raw events older than retention period)
CREATE OR REPLACE FUNCTION cleanup_old_events(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM events
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ─── DE-002: Materialized Views ──────────────────────────────────────────────

-- Daily user stats (for analytics dashboards — last 90 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_user_stats AS
SELECT
  da.user_id,
  da.activity_date,
  da.lessons_completed,
  da.exercises_completed,
  da.quizzes_completed,
  da.xp_earned,
  da.time_spent_seconds,
  p.current_level,
  p.current_streak,
  p.total_xp
FROM daily_activity da
JOIN profiles p ON p.id = da.user_id
WHERE da.activity_date >= CURRENT_DATE - INTERVAL '90 days';

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_user_stats_pk
    ON mv_daily_user_stats(user_id, activity_date);

-- Domain leaderboard (top users per skill domain)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_domain_leaderboard AS
SELECT
  ss.domain,
  ss.user_id,
  ss.composite_score,
  ss.theory_score,
  ss.lab_score,
  ss.quiz_score,
  ss.percentile,
  p.username,
  p.display_name,
  p.avatar_url,
  p.current_level,
  p.total_xp,
  RANK() OVER (PARTITION BY ss.domain ORDER BY ss.composite_score DESC) AS rank
FROM skill_scores ss
JOIN profiles p ON p.id = ss.user_id
WHERE p.public_profile = true
  AND ss.composite_score > 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_domain_leaderboard_pk
    ON mv_domain_leaderboard(domain, user_id);

CREATE INDEX IF NOT EXISTS idx_mv_domain_leaderboard_rank
    ON mv_domain_leaderboard(domain, rank);

-- Global leaderboard (top users by total XP)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_global_leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.current_level,
  p.total_xp,
  p.current_streak,
  p.longest_streak,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p.id) AS badge_count,
  (SELECT COUNT(*) FROM lesson_progress lp
   WHERE lp.user_id = p.id AND lp.status = 'completed') AS lessons_completed,
  RANK() OVER (ORDER BY p.total_xp DESC) AS rank
FROM profiles p
WHERE p.public_profile = true
  AND p.total_xp > 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_global_leaderboard_pk
    ON mv_global_leaderboard(user_id);

-- ─── DE-003: Skill Percentile Calculation ────────────────────────────────────

-- Recalculate percentiles for all skill domains
CREATE OR REPLACE FUNCTION recalculate_skill_percentiles()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE skill_scores ss
  SET percentile = sub.pct
  FROM (
    SELECT
      id,
      ROUND(PERCENT_RANK() OVER (
        PARTITION BY domain
        ORDER BY composite_score
      ) * 100)::INTEGER AS pct
    FROM skill_scores
    WHERE composite_score > 0
  ) sub
  WHERE ss.id = sub.id;
END;
$$;

-- Refresh all materialized views (call nightly or after significant data changes)
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_user_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_domain_leaderboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_global_leaderboard;
END;
$$;
