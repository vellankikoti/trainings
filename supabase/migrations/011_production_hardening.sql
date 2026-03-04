-- Migration 011: Production Hardening
-- Fixes critical race conditions, adds missing indexes, FK constraints, and data repair.
-- Part of enterprise audit remediation (ENTERPRISE_AUDIT_REPORT.md).
--
-- This migration is idempotent and safe to re-run. It creates prerequisite
-- tables/objects with IF NOT EXISTS so it works regardless of which earlier
-- migrations have been applied.

-- ============================================================================
-- 0. Prerequisite tables (from migration 005, created here if missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS xp_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    source_id TEXT,
    dedup_key TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user ON xp_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_source ON xp_log(source, created_at DESC);

-- RLS on xp_log (safe to run even if already enabled)
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'xp_log' AND policyname = 'Users can view own XP log'
  ) THEN
    CREATE POLICY "Users can view own XP log"
      ON xp_log FOR SELECT
      USING (user_id = get_current_profile_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'xp_log' AND policyname = 'Service role can insert XP log'
  ) THEN
    CREATE POLICY "Service role can insert XP log"
      ON xp_log FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS badge_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'award',
    category TEXT NOT NULL CHECK (category IN (
        'streak', 'xp', 'completion', 'lab', 'simulation', 'community', 'special'
    )),
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    criteria JSONB NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'badge_definitions' AND policyname = 'Badge definitions readable by all'
  ) THEN
    CREATE POLICY "Badge definitions readable by all"
      ON badge_definitions FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badge_definitions(id),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, earned_at DESC);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can view own badges'
  ) THEN
    CREATE POLICY "Users can view own badges"
      ON user_badges FOR SELECT
      USING (user_id = get_current_profile_id());
  END IF;
END $$;

-- Seed badge definitions (no-op if already present)
INSERT INTO badge_definitions (id, name, description, icon, category, tier, criteria, xp_reward) VALUES
    ('streak-7', 'Week Warrior', '7-day learning streak', 'flame', 'streak', 'bronze', '{"type": "streak", "days": 7}', 50),
    ('streak-14', 'Fortnight Focus', '14-day learning streak', 'flame', 'streak', 'silver', '{"type": "streak", "days": 14}', 100),
    ('streak-30', 'Monthly Master', '30-day learning streak', 'flame', 'streak', 'gold', '{"type": "streak", "days": 30}', 250),
    ('streak-60', 'Relentless', '60-day learning streak', 'flame', 'streak', 'gold', '{"type": "streak", "days": 60}', 500),
    ('streak-100', 'Centurion', '100-day learning streak', 'flame', 'streak', 'platinum', '{"type": "streak", "days": 100}', 1000),
    ('streak-365', 'Year of Code', '365-day learning streak', 'flame', 'streak', 'platinum', '{"type": "streak", "days": 365}', 10000),
    ('xp-1000', 'Getting Started', 'Earned 1,000 XP', 'zap', 'xp', 'bronze', '{"type": "xp_total", "amount": 1000}', 0),
    ('xp-5000', 'Rising Star', 'Earned 5,000 XP', 'zap', 'xp', 'silver', '{"type": "xp_total", "amount": 5000}', 0),
    ('xp-10000', 'XP Champion', 'Earned 10,000 XP', 'zap', 'xp', 'gold', '{"type": "xp_total", "amount": 10000}', 0),
    ('xp-50000', 'XP Legend', 'Earned 50,000 XP', 'zap', 'xp', 'platinum', '{"type": "xp_total", "amount": 50000}', 0),
    ('first-lesson', 'First Step', 'Completed your first lesson', 'book-open', 'completion', 'bronze', '{"type": "lessons_completed", "count": 1}', 25),
    ('lessons-10', 'Scholar', 'Completed 10 lessons', 'book-open', 'completion', 'bronze', '{"type": "lessons_completed", "count": 10}', 50),
    ('lessons-50', 'Knowledge Seeker', 'Completed 50 lessons', 'book-open', 'completion', 'silver', '{"type": "lessons_completed", "count": 50}', 100),
    ('lessons-100', 'Lesson Master', 'Completed 100 lessons', 'book-open', 'completion', 'gold', '{"type": "lessons_completed", "count": 100}', 200),
    ('first-module', 'Course Complete', 'Completed your first course', 'award', 'completion', 'silver', '{"type": "modules_completed", "count": 1}', 100),
    ('modules-5', 'Multi-Skilled', 'Completed 5 courses', 'award', 'completion', 'gold', '{"type": "modules_completed", "count": 5}', 250),
    ('first-path', 'Path Pioneer', 'Completed your first learning path', 'map', 'completion', 'gold', '{"type": "paths_completed", "count": 1}', 500),
    ('first-quiz', 'Quiz Taker', 'Passed your first quiz', 'help-circle', 'completion', 'bronze', '{"type": "quizzes_passed", "count": 1}', 25),
    ('quiz-perfect', 'Perfect Score', 'Scored 100% on a quiz', 'target', 'completion', 'silver', '{"type": "quiz_perfect", "count": 1}', 75),
    ('first-lab', 'Hands On', 'Completed your first lab', 'terminal', 'lab', 'bronze', '{"type": "labs_completed", "count": 1}', 50),
    ('labs-10', 'Lab Rat', 'Completed 10 labs', 'terminal', 'lab', 'silver', '{"type": "labs_completed", "count": 10}', 100),
    ('labs-25', 'Lab Expert', 'Completed 25 labs', 'terminal', 'lab', 'gold', '{"type": "labs_completed", "count": 25}', 250),
    ('skill-50', 'Skill Builder', 'Reached 50+ composite score in any domain', 'bar-chart', 'special', 'silver', '{"type": "skill_score", "min_score": 50}', 100),
    ('skill-80', 'Domain Expert', 'Reached 80+ composite score in any domain', 'bar-chart', 'special', 'gold', '{"type": "skill_score", "min_score": 80}', 250)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 1. Atomic XP increment function (fixes CRITICAL-01: XP race condition)
-- ============================================================================
-- Replaces read-then-write pattern in awardXPWithLog() with atomic SQL update.
-- Returns new total and old level so caller can detect level-ups.

CREATE OR REPLACE FUNCTION increment_xp(p_user_id uuid, p_amount int)
RETURNS TABLE(new_total int, old_level int) AS $$
  UPDATE profiles
  SET total_xp = total_xp + p_amount
  WHERE id = p_user_id
  RETURNING total_xp AS new_total, current_level AS old_level;
$$ LANGUAGE sql;

-- ============================================================================
-- 2. Dedup key uniqueness (fixes TOCTOU race on xp_log dedup check)
-- ============================================================================
-- Partial unique index — only enforced when dedup_key is not null.
-- Prevents two concurrent requests from both passing the SELECT check.
-- NOTE: Migration 005 creates idx_xp_log_dedup with the same columns.
-- This is a no-op if that index already exists (same definition, different name).

CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_log_dedup_unique
  ON xp_log(user_id, dedup_key) WHERE dedup_key IS NOT NULL;

-- ============================================================================
-- 3. Composite indexes for hot query paths (fixes HIGH #6)
-- ============================================================================
-- These cover the most frequent multi-column lookups identified in the audit.
-- Each uses IF NOT EXISTS so it's safe if tables don't exist yet or indexes
-- were already created.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_progress') THEN
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_path_module
      ON lesson_progress(user_id, path_slug, module_slug);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'module_progress') THEN
    CREATE INDEX IF NOT EXISTS idx_module_progress_user_path
      ON module_progress(user_id, path_slug);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_attempts') THEN
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz
      ON quiz_attempts(user_id, quiz_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    CREATE INDEX IF NOT EXISTS idx_events_user_type_created
      ON events(user_id, event_type, created_at);
  END IF;
END $$;

-- ============================================================================
-- 4. Foreign key on events.user_id (fixes HIGH #13: GDPR orphan risk)
-- ============================================================================
-- CASCADE delete ensures events are cleaned up when profile is deleted.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'fk_events_user_id'
         AND table_name = 'events'
     )
  THEN
    ALTER TABLE events ADD CONSTRAINT fk_events_user_id
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 5. Org quota CHECK constraints (fixes HIGH #12: TOCTOU race)
-- ============================================================================
-- Prevents quota going negative even if application-level check is bypassed.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name = 'chk_profile_views_nonneg'
    ) THEN
      ALTER TABLE organizations ADD CONSTRAINT chk_profile_views_nonneg
        CHECK (profile_views_remaining >= 0);
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name = 'chk_contacts_nonneg'
    ) THEN
      ALTER TABLE organizations ADD CONSTRAINT chk_contacts_nonneg
        CHECK (contacts_remaining >= 0);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 6. Data repair: fix falsely-completed paths (fixes CRITICAL-05)
-- ============================================================================
-- Clear completed_at on paths where not all modules are actually done.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'path_progress') THEN
    UPDATE path_progress SET completed_at = NULL
    WHERE modules_completed < modules_total AND completed_at IS NOT NULL;

    -- Also clear any path_progress where modules_total was set to a wrong low value
    -- (e.g., 1 when actual is 6). These will be recalculated on next access.
    UPDATE path_progress SET percentage = 0, completed_at = NULL
    WHERE modules_total <= modules_completed
      AND modules_total <= 1
      AND modules_completed <= 1
      AND completed_at IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 7. Add timezone column to profiles (MEDIUM-20: timezone-aware streaks)
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;

-- ============================================================================
-- 8. Widen lesson_progress UNIQUE to include path/module context (MEDIUM-37)
-- ============================================================================
-- The original constraint (user_id, lesson_slug) is too narrow — the same
-- lesson slug can appear in different paths/modules. Widen to include context.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_progress') THEN
    -- Drop old narrow constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'lesson_progress_user_id_lesson_slug_key'
        AND table_name = 'lesson_progress'
    ) THEN
      ALTER TABLE lesson_progress DROP CONSTRAINT lesson_progress_user_id_lesson_slug_key;
    END IF;

    -- Create wider unique index (path + module + lesson)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_progress_user_path_module_lesson
      ON lesson_progress(user_id, path_slug, module_slug, lesson_slug);
  END IF;
END $$;
