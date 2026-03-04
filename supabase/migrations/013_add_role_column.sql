-- Migration 013: Add role column to profiles
-- The role column was defined in 004_cte_foundation.sql but that migration
-- was never applied. This adds the column standalone.
-- Idempotent: safe to re-run.

-- Add role column with CHECK constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'learner'
      CHECK (role IN ('learner', 'trainer', 'institute_admin', 'recruiter', 'org_admin', 'admin', 'super_admin'));
  END IF;
END $$;

-- Index for role-based queries (sidebar, dashboard routing)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
