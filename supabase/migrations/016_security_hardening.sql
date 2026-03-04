-- 016_security_hardening.sql
-- Security fixes identified during enterprise readiness audit.
-- Rollback: DROP INDEX IF EXISTS idx_org_members_unique_active;
--           DROP INDEX IF EXISTS idx_institute_members_unique_active;
--           DROP FUNCTION IF EXISTS safe_batch_enroll;
--           ALTER TABLE profiles DROP COLUMN IF EXISTS deletion_requested_at;

-- ============================================================================
-- GDPR: Add deletion_requested_at column to profiles
-- Used by /api/profile/delete-request to mark accounts for deletion.
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- ============================================================================
-- P0-4: Unique constraints on active memberships
-- Prevents duplicate active memberships after soft-delete + re-add.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_unique_active
    ON org_members(user_id, org_id) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_institute_members_unique_active
    ON institute_members(user_id, institute_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- P0-5: Atomic enrollment with capacity lock
-- Prevents race condition where concurrent enrollments exceed max_students.
-- Locks the institute row during the check-and-insert operation.
-- ============================================================================

CREATE OR REPLACE FUNCTION safe_batch_enroll(
    p_institute_id UUID,
    p_batch_id UUID,
    p_usernames TEXT[],
    p_enrolled_by UUID
) RETURNS JSONB AS $$
DECLARE
    v_max_students INT;
    v_current_count INT;
    v_batch_exists BOOLEAN;
    v_profile RECORD;
    v_enrolled INT := 0;
    v_skipped INT := 0;
    v_not_found TEXT[] := '{}';
    v_found_usernames TEXT[] := '{}';
BEGIN
    -- Verify batch belongs to institute
    SELECT EXISTS(
        SELECT 1 FROM batches
        WHERE id = p_batch_id AND institute_id = p_institute_id AND deleted_at IS NULL
    ) INTO v_batch_exists;

    IF NOT v_batch_exists THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND';
    END IF;

    -- Lock the institute row to serialize capacity checks
    SELECT COALESCE(max_students, 50) INTO v_max_students
    FROM institutes
    WHERE id = p_institute_id
    FOR UPDATE;

    -- Count current active enrollments across all batches of this institute
    SELECT COUNT(*) INTO v_current_count
    FROM batch_enrollments be
    JOIN batches b ON b.id = be.batch_id
    WHERE b.institute_id = p_institute_id
      AND b.deleted_at IS NULL
      AND be.status = 'active';

    -- Check capacity before proceeding
    IF v_current_count + array_length(p_usernames, 1) > v_max_students THEN
        RAISE EXCEPTION 'CAPACITY_EXCEEDED:% slots remaining', v_max_students - v_current_count;
    END IF;

    -- Resolve usernames and enroll
    FOR v_profile IN
        SELECT p.id, p.username
        FROM profiles p
        WHERE p.username = ANY(p_usernames)
          AND p.deleted_at IS NULL
    LOOP
        v_found_usernames := array_append(v_found_usernames, v_profile.username);

        -- Skip if already enrolled in this batch
        IF EXISTS (
            SELECT 1 FROM batch_enrollments
            WHERE batch_id = p_batch_id
              AND user_id = v_profile.id
              AND status = 'active'
        ) THEN
            v_skipped := v_skipped + 1;
            CONTINUE;
        END IF;

        INSERT INTO batch_enrollments (batch_id, user_id, enrolled_by, status)
        VALUES (p_batch_id, v_profile.id, p_enrolled_by, 'active');

        v_enrolled := v_enrolled + 1;
    END LOOP;

    -- Identify not-found usernames
    v_not_found := ARRAY(
        SELECT unnest(p_usernames)
        EXCEPT
        SELECT unnest(v_found_usernames)
    );

    RETURN jsonb_build_object(
        'enrolled', v_enrolled,
        'skipped', v_skipped,
        'not_found', to_jsonb(v_not_found)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
