-- =============================================
-- DEVOPS ENGINEERS — Seed Data
-- =============================================
-- Test data for local development.
-- This data is for development only and should NOT be used in production.
-- =============================================

-- Test user profile (use a matching Clerk test user ID)
INSERT INTO profiles (
  id, clerk_id, username, display_name, bio,
  experience_level, weekly_hours, primary_goal, recommended_path,
  current_level, total_xp, current_streak, longest_streak,
  last_activity_date
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'user_test_dev_001',
  'testuser',
  'Test User',
  'A passionate learner on the DevOps journey.',
  'beginner',
  '5-10',
  'career_change',
  'foundations',
  3,
  1250,
  5,
  12,
  CURRENT_DATE
);

-- Sample lesson progress
INSERT INTO lesson_progress (user_id, lesson_slug, path_slug, module_slug, status, started_at, completed_at, time_spent_seconds, xp_earned)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'what-is-linux', 'foundations', 'linux-fundamentals', 'completed', now() - interval '7 days', now() - interval '7 days', 1200, 25),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'terminal-basics', 'foundations', 'linux-fundamentals', 'completed', now() - interval '6 days', now() - interval '6 days', 1800, 25),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'file-system-navigation', 'foundations', 'linux-fundamentals', 'completed', now() - interval '5 days', now() - interval '5 days', 2400, 30),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'file-permissions', 'foundations', 'linux-fundamentals', 'in_progress', now() - interval '4 days', NULL, 900, 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'git-basics', 'foundations', 'git-essentials', 'completed', now() - interval '3 days', now() - interval '3 days', 2100, 25);

-- Sample module progress
INSERT INTO module_progress (user_id, path_slug, module_slug, lessons_total, lessons_completed, percentage, started_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'foundations', 'linux-fundamentals', 12, 3, 25.00, now() - interval '7 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'foundations', 'git-essentials', 8, 1, 12.50, now() - interval '3 days');

-- Sample path progress
INSERT INTO path_progress (user_id, path_slug, modules_total, modules_completed, percentage, started_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'foundations', 6, 0, 0.00, now() - interval '7 days');

-- Sample daily activity
INSERT INTO daily_activity (user_id, activity_date, lessons_completed, exercises_completed, xp_earned, time_spent_seconds)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - 4, 1, 3, 30, 2400),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - 3, 1, 2, 25, 2100),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - 2, 2, 4, 55, 3600),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - 1, 1, 1, 25, 1800),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, 0, 0, 0, 0);

-- Sample achievement
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'first-lesson', now() - interval '7 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'five-day-streak', now() - interval '1 day');
