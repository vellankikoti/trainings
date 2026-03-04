-- =============================================
-- Migration 008: RLS Policy Audit Fixes
-- =============================================
-- Fixes identified during Phase 1.3 security audit:
--   1. Standardize auth pattern: replace auth.uid()::text with get_current_profile_id()
--   2. Add missing INSERT/DELETE policies on user-owned tables
--   3. Add service-role INSERT policies for system-managed tables
-- Idempotent: safe to re-run (uses DROP IF EXISTS before CREATE).

-- =============================================
-- 1. FIX: Subscriptions — inconsistent auth pattern
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
    CREATE POLICY "Users can view own subscription"
        ON subscriptions FOR SELECT
        USING (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 2. FIX: Discussions — inconsistent auth pattern + missing DELETE
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussions') THEN
    DROP POLICY IF EXISTS "Users can create discussions" ON discussions;
    CREATE POLICY "Users can create discussions"
        ON discussions FOR INSERT
        WITH CHECK (user_id = get_current_profile_id());

    DROP POLICY IF EXISTS "Users can edit own discussions" ON discussions;
    CREATE POLICY "Users can edit own discussions"
        ON discussions FOR UPDATE
        USING (user_id = get_current_profile_id());

    -- Users can soft-delete own discussions
    DROP POLICY IF EXISTS "Users can delete own discussions" ON discussions;
    CREATE POLICY "Users can delete own discussions"
        ON discussions FOR DELETE
        USING (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 3. FIX: Discussion votes — inconsistent auth pattern
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussion_votes') THEN
    DROP POLICY IF EXISTS "Users can vote" ON discussion_votes;
    CREATE POLICY "Users can vote"
        ON discussion_votes FOR INSERT
        WITH CHECK (user_id = get_current_profile_id());

    DROP POLICY IF EXISTS "Users can change own votes" ON discussion_votes;
    CREATE POLICY "Users can change own votes"
        ON discussion_votes FOR DELETE
        USING (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 4. FIX: Notifications — add DELETE policy for cleanup
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
    CREATE POLICY "Users can delete own notifications"
        ON notifications FOR DELETE
        USING (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 5. FIX: XP log — add INSERT policy for service operations
--    Note: XP is awarded via admin client, but defense-in-depth
--    INSERT is restricted to own records only
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'xp_log') THEN
    DROP POLICY IF EXISTS "Users can insert own XP log" ON xp_log;
    CREATE POLICY "Users can insert own XP log"
        ON xp_log FOR INSERT
        WITH CHECK (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 6. FIX: User badges — add INSERT policy for badge earning
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
    DROP POLICY IF EXISTS "Users can earn badges" ON user_badges;
    CREATE POLICY "Users can earn badges"
        ON user_badges FOR INSERT
        WITH CHECK (user_id = get_current_profile_id());
  END IF;
END $$;

-- =============================================
-- 7. FIX: User achievements — add INSERT policy
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
    DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;
    CREATE POLICY "Users can earn achievements"
        ON user_achievements FOR INSERT
        WITH CHECK (user_id = get_current_profile_id());
  END IF;
END $$;
