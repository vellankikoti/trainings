-- Migration 010: Repair False Module Completions
-- Resets module_progress rows that were falsely marked as completed
-- due to the totalFromContent fallback bug (using started lessons count
-- as total, causing 1/1 = 100% when only 1 of 20 lessons was done).
-- Idempotent: safe to re-run (UPDATE is a no-op if already repaired).

DO $$
BEGIN
  -- Reset modules where completed_at is set but lessons_completed < lessons_total
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'module_progress') THEN
    UPDATE module_progress
    SET completed_at = NULL,
        percentage = CASE
          WHEN lessons_total > 0 THEN ROUND((lessons_completed::numeric / lessons_total) * 100)
          ELSE 0
        END
    WHERE completed_at IS NOT NULL
      AND lessons_total > 0
      AND lessons_completed < lessons_total;

    -- Also reset modules where lessons_total is 0 or 1 with completed_at set
    -- (likely victims of the fallback bug)
    UPDATE module_progress
    SET completed_at = NULL,
        percentage = 0
    WHERE completed_at IS NOT NULL
      AND lessons_total <= 1
      AND lessons_completed <= 1;
  END IF;

  -- Reset any path_progress that was falsely completed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'path_progress') THEN
    UPDATE path_progress
    SET completed_at = NULL,
        percentage = CASE
          WHEN modules_total > 0 THEN ROUND((modules_completed::numeric / modules_total) * 100)
          ELSE 0
        END
    WHERE completed_at IS NOT NULL
      AND modules_total > 0
      AND modules_completed < modules_total;
  END IF;
END $$;
