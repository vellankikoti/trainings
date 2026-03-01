-- =============================================
-- DEVOPS ENGINEERS — Initial Database Schema
-- =============================================
-- This migration creates all core tables for the learning platform.
-- Auth is handled by Clerk; Supabase is used for data storage only.
-- =============================================

-- =============================================
-- USER PROFILES
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  experience_level TEXT,
  weekly_hours TEXT,
  primary_goal TEXT,
  recommended_path TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  theme TEXT DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  public_profile BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PROGRESS TRACKING
-- =============================================

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  path_slug TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_slug)
);

CREATE TABLE exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_slug, exercise_id)
);

CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  lessons_total INTEGER NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_slug, module_slug)
);

CREATE TABLE path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  modules_total INTEGER NOT NULL,
  modules_completed INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_slug)
);

-- =============================================
-- QUIZ SYSTEM
-- =============================================

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  lesson_slug TEXT,
  module_slug TEXT,
  score DECIMAL(5,2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  passed BOOLEAN NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer TEXT,
  correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER
);

-- =============================================
-- PROJECTS
-- =============================================

CREATE TABLE project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  repository_url TEXT,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, project_slug)
);

-- =============================================
-- CERTIFICATES
-- =============================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  path_slug TEXT,
  module_slug TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  verification_code TEXT UNIQUE NOT NULL,
  public_url TEXT
);

-- =============================================
-- ACHIEVEMENTS
-- =============================================

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- DAILY ACTIVITY / STREAKS
-- =============================================

CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_slug);
CREATE INDEX idx_exercise_progress_user ON exercise_progress(user_id);
CREATE INDEX idx_module_progress_user ON module_progress(user_id);
CREATE INDEX idx_path_progress_user ON path_progress(user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_responses_attempt ON quiz_responses(attempt_id);
CREATE INDEX idx_project_progress_user ON project_progress(user_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles: users can read/update their own, public profiles visible to all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (public_profile = true);

-- Helper: reusable function to get profile ID from JWT
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Lesson progress: private to user
CREATE POLICY "Users can manage own lesson progress"
  ON lesson_progress FOR ALL
  USING (user_id = get_current_profile_id());

-- Exercise progress: private to user
CREATE POLICY "Users can manage own exercise progress"
  ON exercise_progress FOR ALL
  USING (user_id = get_current_profile_id());

-- Module progress: private to user
CREATE POLICY "Users can manage own module progress"
  ON module_progress FOR ALL
  USING (user_id = get_current_profile_id());

-- Path progress: private to user
CREATE POLICY "Users can manage own path progress"
  ON path_progress FOR ALL
  USING (user_id = get_current_profile_id());

-- Quiz attempts: private to user
CREATE POLICY "Users can manage own quiz attempts"
  ON quiz_attempts FOR ALL
  USING (user_id = get_current_profile_id());

-- Quiz responses: private (through attempt ownership)
CREATE POLICY "Users can manage own quiz responses"
  ON quiz_responses FOR ALL
  USING (attempt_id IN (
    SELECT id FROM quiz_attempts WHERE user_id = get_current_profile_id()
  ));

-- Project progress: private to user
CREATE POLICY "Users can manage own project progress"
  ON project_progress FOR ALL
  USING (user_id = get_current_profile_id());

-- Certificates: viewable by owner, public verification by code
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (user_id = get_current_profile_id());

CREATE POLICY "Certificates verifiable by code"
  ON certificates FOR SELECT
  USING (verification_code IS NOT NULL);

-- Achievements: private to user
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (user_id = get_current_profile_id());

-- Daily activity: private to user
CREATE POLICY "Users can manage own daily activity"
  ON daily_activity FOR ALL
  USING (user_id = get_current_profile_id());

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
