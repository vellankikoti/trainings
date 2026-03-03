-- =============================================
-- Migration 005: XP History Log & Badge System
-- =============================================

-- XP log — every XP award is recorded with source, amount, dedup key
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

-- Prevent duplicate XP awards for the same action
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_log_dedup
    ON xp_log(user_id, dedup_key)
    WHERE dedup_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_xp_log_user ON xp_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_source ON xp_log(source, created_at DESC);

-- Badge definitions — what badges exist
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

-- User badges — which badges a user has earned
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badge_definitions(id),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, earned_at DESC);

-- RLS
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own XP log"
    ON xp_log FOR SELECT
    USING (user_id = get_current_profile_id());

CREATE POLICY "Badge definitions readable by all"
    ON badge_definitions FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    USING (user_id = get_current_profile_id());

-- Insert initial badge definitions
INSERT INTO badge_definitions (id, name, description, icon, category, tier, criteria, xp_reward) VALUES
    -- Streak badges
    ('streak-7', 'Week Warrior', '7-day learning streak', 'flame', 'streak', 'bronze', '{"type": "streak", "days": 7}', 50),
    ('streak-14', 'Fortnight Focus', '14-day learning streak', 'flame', 'streak', 'silver', '{"type": "streak", "days": 14}', 100),
    ('streak-30', 'Monthly Master', '30-day learning streak', 'flame', 'streak', 'gold', '{"type": "streak", "days": 30}', 250),
    ('streak-60', 'Relentless', '60-day learning streak', 'flame', 'streak', 'gold', '{"type": "streak", "days": 60}', 500),
    ('streak-100', 'Centurion', '100-day learning streak', 'flame', 'streak', 'platinum', '{"type": "streak", "days": 100}', 1000),
    ('streak-365', 'Year of Code', '365-day learning streak', 'flame', 'streak', 'platinum', '{"type": "streak", "days": 365}', 10000),

    -- XP badges
    ('xp-1000', 'Getting Started', 'Earned 1,000 XP', 'zap', 'xp', 'bronze', '{"type": "xp_total", "amount": 1000}', 0),
    ('xp-5000', 'Rising Star', 'Earned 5,000 XP', 'zap', 'xp', 'silver', '{"type": "xp_total", "amount": 5000}', 0),
    ('xp-10000', 'XP Champion', 'Earned 10,000 XP', 'zap', 'xp', 'gold', '{"type": "xp_total", "amount": 10000}', 0),
    ('xp-50000', 'XP Legend', 'Earned 50,000 XP', 'zap', 'xp', 'platinum', '{"type": "xp_total", "amount": 50000}', 0),

    -- Completion badges
    ('first-lesson', 'First Step', 'Completed your first lesson', 'book-open', 'completion', 'bronze', '{"type": "lessons_completed", "count": 1}', 25),
    ('lessons-10', 'Scholar', 'Completed 10 lessons', 'book-open', 'completion', 'bronze', '{"type": "lessons_completed", "count": 10}', 50),
    ('lessons-50', 'Knowledge Seeker', 'Completed 50 lessons', 'book-open', 'completion', 'silver', '{"type": "lessons_completed", "count": 50}', 100),
    ('lessons-100', 'Lesson Master', 'Completed 100 lessons', 'book-open', 'completion', 'gold', '{"type": "lessons_completed", "count": 100}', 200),
    ('first-module', 'Course Complete', 'Completed your first course', 'award', 'completion', 'silver', '{"type": "modules_completed", "count": 1}', 100),
    ('modules-5', 'Multi-Skilled', 'Completed 5 courses', 'award', 'completion', 'gold', '{"type": "modules_completed", "count": 5}', 250),
    ('first-path', 'Path Pioneer', 'Completed your first learning path', 'map', 'completion', 'gold', '{"type": "paths_completed", "count": 1}', 500),

    -- Quiz badges
    ('first-quiz', 'Quiz Taker', 'Passed your first quiz', 'help-circle', 'completion', 'bronze', '{"type": "quizzes_passed", "count": 1}', 25),
    ('quiz-perfect', 'Perfect Score', 'Scored 100% on a quiz', 'target', 'completion', 'silver', '{"type": "quiz_perfect", "count": 1}', 75),

    -- Lab badges
    ('first-lab', 'Hands On', 'Completed your first lab', 'terminal', 'lab', 'bronze', '{"type": "labs_completed", "count": 1}', 50),
    ('labs-10', 'Lab Rat', 'Completed 10 labs', 'terminal', 'lab', 'silver', '{"type": "labs_completed", "count": 10}', 100),
    ('labs-25', 'Lab Expert', 'Completed 25 labs', 'terminal', 'lab', 'gold', '{"type": "labs_completed", "count": 25}', 250),

    -- Skill badges
    ('skill-50', 'Skill Builder', 'Reached 50+ composite score in any domain', 'bar-chart', 'special', 'silver', '{"type": "skill_score", "min_score": 50}', 100),
    ('skill-80', 'Domain Expert', 'Reached 80+ composite score in any domain', 'bar-chart', 'special', 'gold', '{"type": "skill_score", "min_score": 80}', 250)
ON CONFLICT (id) DO NOTHING;
