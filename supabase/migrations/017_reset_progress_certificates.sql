-- Migration 017: Reset Progress & Certificate Support
-- Adds decrement_xp function for safe XP subtraction during progress reset.
-- Idempotent and safe to re-run.

-- ============================================================================
-- 1. Safe XP decrement function (mirrors increment_xp from migration 011)
-- ============================================================================
-- Clamps at zero so total_xp can never go negative.

CREATE OR REPLACE FUNCTION decrement_xp(p_user_id uuid, p_amount int)
RETURNS TABLE(new_total int, old_level int) AS $$
  UPDATE profiles
  SET total_xp = GREATEST(total_xp - p_amount, 0)
  WHERE id = p_user_id
  RETURNING total_xp AS new_total, current_level AS old_level;
$$ LANGUAGE sql;
