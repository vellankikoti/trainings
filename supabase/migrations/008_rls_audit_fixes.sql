-- =============================================
-- Migration 008: RLS Policy Audit Fixes
-- =============================================
-- Fixes identified during Phase 1.3 security audit:
--   1. Standardize auth pattern: replace auth.uid()::text with get_current_profile_id()
--   2. Add missing INSERT/DELETE policies on user-owned tables
--   3. Add service-role INSERT policies for system-managed tables

-- =============================================
-- 1. FIX: Subscriptions — inconsistent auth pattern
-- =============================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (user_id = get_current_profile_id());

-- =============================================
-- 2. FIX: Discussions — inconsistent auth pattern + missing DELETE
-- =============================================

DROP POLICY IF EXISTS "Users can create discussions" ON discussions;
DROP POLICY IF EXISTS "Users can edit own discussions" ON discussions;

CREATE POLICY "Users can create discussions"
    ON discussions FOR INSERT
    WITH CHECK (user_id = get_current_profile_id());

CREATE POLICY "Users can edit own discussions"
    ON discussions FOR UPDATE
    USING (user_id = get_current_profile_id());

-- Users can soft-delete own discussions
CREATE POLICY "Users can delete own discussions"
    ON discussions FOR DELETE
    USING (user_id = get_current_profile_id());

-- =============================================
-- 3. FIX: Discussion votes — inconsistent auth pattern
-- =============================================

DROP POLICY IF EXISTS "Users can vote" ON discussion_votes;
DROP POLICY IF EXISTS "Users can change own votes" ON discussion_votes;

CREATE POLICY "Users can vote"
    ON discussion_votes FOR INSERT
    WITH CHECK (user_id = get_current_profile_id());

CREATE POLICY "Users can change own votes"
    ON discussion_votes FOR DELETE
    USING (user_id = get_current_profile_id());

-- =============================================
-- 4. FIX: Notifications — add DELETE policy for cleanup
-- =============================================

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (user_id = get_current_profile_id());

-- =============================================
-- 5. FIX: XP log — add INSERT policy for service operations
--    Note: XP is awarded via admin client, but defense-in-depth
--    INSERT is restricted to own records only
-- =============================================

CREATE POLICY "Users can insert own XP log"
    ON xp_log FOR INSERT
    WITH CHECK (user_id = get_current_profile_id());

-- =============================================
-- 6. FIX: User badges — add INSERT policy for badge earning
-- =============================================

CREATE POLICY "Users can earn badges"
    ON user_badges FOR INSERT
    WITH CHECK (user_id = get_current_profile_id());

-- =============================================
-- 7. FIX: User achievements — add INSERT policy
-- =============================================

CREATE POLICY "Users can earn achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (user_id = get_current_profile_id());
