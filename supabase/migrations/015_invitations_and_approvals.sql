-- Migration 015: Invitations, Approvals, Soft-Delete, Audit Log
-- Enables self-service org/institute registration with approval workflow,
-- email-based invitation system, and soft-delete across critical tables.
-- Idempotent: safe to re-run.

BEGIN;

-- =============================================
-- 1. INVITATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'institute')),
    entity_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('trainer', 'institute_admin', 'recruiter', 'org_admin')),
    token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
    message TEXT CHECK (char_length(message) <= 500),
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resend_count INT NOT NULL DEFAULT 0 CHECK (resend_count >= 0 AND resend_count <= 5),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    last_resent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invitations_email_status
    ON invitations (email, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_entity
    ON invitations (entity_type, entity_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
    ON invitations (invited_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash
    ON invitations (token_hash) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at
    ON invitations (expires_at) WHERE status = 'pending';

-- One pending invitation per email per entity
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
    ON invitations (email, entity_type, entity_id)
    WHERE status = 'pending' AND deleted_at IS NULL;

-- =============================================
-- 2. APPROVAL REQUESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'institute')),
    entity_id UUID NOT NULL,
    requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending_review'
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'cancelled')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT CHECK (char_length(review_notes) <= 1000),
    rejection_reason TEXT CHECK (char_length(rejection_reason) <= 500),
    escalated BOOLEAN NOT NULL DEFAULT false,
    escalated_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_status
    ON approval_requests (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity
    ON approval_requests (entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by
    ON approval_requests (requested_by) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_approval_requests_unique_pending
    ON approval_requests (entity_type, entity_id)
    WHERE status = 'pending_review' AND deleted_at IS NULL;

-- =============================================
-- 3. SYSTEM SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO system_settings (key, value, description) VALUES
    ('org_registration_requires_approval', 'true', 'Whether new org registrations require admin approval'),
    ('institute_registration_requires_approval', 'true', 'Whether new institute registrations require admin approval'),
    ('invitation_expiry_days', '7', 'Days before invitation expires'),
    ('max_invitations_per_entity_per_day', '100', 'Max invitations per entity per day'),
    ('max_resends_per_invitation', '3', 'Max resends per invitation'),
    ('soft_delete_retention_days', '90', 'Days to retain soft-deleted records')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 4. AUDIT LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role TEXT,
    actor_ip_hash TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);

-- =============================================
-- 5. ADD SOFT DELETE + STATUS TO EXISTING TABLES
-- =============================================

-- Organizations: add status + owner_id + deleted_at
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
    deleted_at TIMESTAMPTZ;

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'status'
    ) THEN
        ALTER TABLE organizations ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
            CHECK (status IN ('pending_review', 'active', 'suspended', 'archived', 'rejected'));
    END IF;
END $$;

-- Institutes: add status + owner_id + deleted_at
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS
    deleted_at TIMESTAMPTZ;

ALTER TABLE institutes ADD COLUMN IF NOT EXISTS
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'institutes' AND column_name = 'status'
    ) THEN
        ALTER TABLE institutes ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
            CHECK (status IN ('pending_review', 'active', 'suspended', 'archived', 'rejected'));
    END IF;
END $$;

-- Memberships: add deleted_at + updated_at
ALTER TABLE org_members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE org_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE institute_members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE institute_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Batches: add deleted_at
ALTER TABLE batches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Batch enrollments: add deleted_at
ALTER TABLE batch_enrollments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Job postings: add deleted_at
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Profiles: add deleted_at (for GDPR)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- =============================================
-- 6. PARTIAL INDEXES FOR SOFT DELETE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_institutes_active ON institutes (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_institutes_status ON institutes (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_active ON org_members (org_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_institute_members_active ON institute_members (institute_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_batches_active ON batches (institute_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles (id) WHERE deleted_at IS NULL;

-- =============================================
-- 7. UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER IF NOT EXISTS update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_approval_requests_updated_at
    BEFORE UPDATE ON approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add missing updated_at triggers to existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_org_members_updated_at'
    ) THEN
        CREATE TRIGGER update_org_members_updated_at
            BEFORE UPDATE ON org_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_institute_members_updated_at'
    ) THEN
        CREATE TRIGGER update_institute_members_updated_at
            BEFORE UPDATE ON institute_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- =============================================
-- 8. RLS POLICIES
-- =============================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Service role access (all operations via API layer)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invitations_service_role') THEN
        CREATE POLICY invitations_service_role ON invitations
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'approval_requests_service_role') THEN
        CREATE POLICY approval_requests_service_role ON approval_requests
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'system_settings_service_role') THEN
        CREATE POLICY system_settings_service_role ON system_settings
            FOR ALL USING (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_log_service_role') THEN
        CREATE POLICY audit_log_service_role ON audit_log
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- =============================================
-- 9. RPC FUNCTIONS FOR ATOMIC OPERATIONS
-- =============================================

-- Accept invitation atomically
CREATE OR REPLACE FUNCTION accept_invitation(
    p_invitation_id UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_invitation RECORD;
    v_membership_id UUID;
    v_entity_name TEXT;
BEGIN
    -- Lock the invitation row
    SELECT * INTO v_invitation
    FROM invitations
    WHERE id = p_invitation_id AND deleted_at IS NULL
    FOR UPDATE;

    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'INVITATION_NOT_FOUND';
    END IF;

    IF v_invitation.status != 'pending' THEN
        RAISE EXCEPTION 'INVITATION_NOT_PENDING:%', v_invitation.status;
    END IF;

    IF v_invitation.expires_at < now() THEN
        UPDATE invitations SET status = 'expired', updated_at = now()
        WHERE id = p_invitation_id;
        RAISE EXCEPTION 'INVITATION_EXPIRED';
    END IF;

    -- Create membership based on entity type
    IF v_invitation.entity_type = 'organization' THEN
        IF EXISTS (
            SELECT 1 FROM org_members
            WHERE org_id = v_invitation.entity_id
              AND user_id = p_user_id
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'ALREADY_MEMBER';
        END IF;

        INSERT INTO org_members (org_id, user_id, role, invited_by)
        VALUES (v_invitation.entity_id, p_user_id, v_invitation.role, v_invitation.invited_by)
        RETURNING id INTO v_membership_id;

        SELECT name INTO v_entity_name FROM organizations WHERE id = v_invitation.entity_id;

    ELSIF v_invitation.entity_type = 'institute' THEN
        IF EXISTS (
            SELECT 1 FROM institute_members
            WHERE institute_id = v_invitation.entity_id
              AND user_id = p_user_id
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'ALREADY_MEMBER';
        END IF;

        INSERT INTO institute_members (institute_id, user_id, role, invited_by)
        VALUES (v_invitation.entity_id, p_user_id, v_invitation.role, v_invitation.invited_by)
        RETURNING id INTO v_membership_id;

        SELECT name INTO v_entity_name FROM institutes WHERE id = v_invitation.entity_id;
    END IF;

    -- Update invitation status
    UPDATE invitations
    SET status = 'accepted', accepted_by = p_user_id, accepted_at = now(), updated_at = now()
    WHERE id = p_invitation_id;

    -- Update user role if currently learner
    UPDATE profiles
    SET role = v_invitation.role, updated_at = now()
    WHERE id = p_user_id AND role = 'learner';

    RETURN jsonb_build_object(
        'membership_id', v_membership_id,
        'role', v_invitation.role,
        'entity_type', v_invitation.entity_type,
        'entity_id', v_invitation.entity_id,
        'entity_name', v_entity_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register organization atomically
CREATE OR REPLACE FUNCTION register_organization(
    p_user_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_description TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_company_size TEXT DEFAULT NULL,
    p_location_city TEXT DEFAULT NULL,
    p_location_country TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_requires_approval BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
    v_org_id UUID;
    v_status TEXT;
    v_approval_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM organizations WHERE slug = p_slug AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'SLUG_TAKEN';
    END IF;

    v_status := CASE WHEN p_requires_approval THEN 'pending_review' ELSE 'active' END;

    INSERT INTO organizations (name, slug, description, website, company_size, location_city, location_country, billing_email, status, owner_id)
    VALUES (p_name, p_slug, p_description, p_website, p_company_size, p_location_city, p_location_country, p_billing_email, v_status, p_user_id)
    RETURNING id INTO v_org_id;

    INSERT INTO org_members (org_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'org_admin');

    UPDATE profiles SET role = 'org_admin', updated_at = now()
    WHERE id = p_user_id AND role = 'learner';

    IF p_requires_approval THEN
        INSERT INTO approval_requests (entity_type, entity_id, requested_by)
        VALUES ('organization', v_org_id, p_user_id)
        RETURNING id INTO v_approval_id;
    END IF;

    RETURN jsonb_build_object(
        'id', v_org_id,
        'name', p_name,
        'slug', p_slug,
        'status', v_status,
        'approval_id', v_approval_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register institute atomically
CREATE OR REPLACE FUNCTION register_institute(
    p_user_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_description TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_requires_approval BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
    v_inst_id UUID;
    v_status TEXT;
    v_approval_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM institutes WHERE slug = p_slug AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'SLUG_TAKEN';
    END IF;

    v_status := CASE WHEN p_requires_approval THEN 'pending_review' ELSE 'active' END;

    INSERT INTO institutes (name, slug, description, website, billing_email, status, owner_id)
    VALUES (p_name, p_slug, p_description, p_website, p_billing_email, v_status, p_user_id)
    RETURNING id INTO v_inst_id;

    INSERT INTO institute_members (institute_id, user_id, role)
    VALUES (v_inst_id, p_user_id, 'institute_admin');

    UPDATE profiles SET role = 'institute_admin', updated_at = now()
    WHERE id = p_user_id AND role = 'learner';

    IF p_requires_approval THEN
        INSERT INTO approval_requests (entity_type, entity_id, requested_by)
        VALUES ('institute', v_inst_id, p_user_id)
        RETURNING id INTO v_approval_id;
    END IF;

    RETURN jsonb_build_object(
        'id', v_inst_id,
        'name', p_name,
        'slug', p_slug,
        'status', v_status,
        'approval_id', v_approval_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove member atomically
CREATE OR REPLACE FUNCTION remove_member(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_user_id UUID,
    p_removed_by UUID
) RETURNS JSONB AS $$
DECLARE
    v_admin_count INT;
    v_member_role TEXT;
    v_has_other_memberships BOOLEAN;
BEGIN
    IF p_entity_type = 'organization' THEN
        SELECT role INTO v_member_role FROM org_members
        WHERE org_id = p_entity_id AND user_id = p_user_id AND deleted_at IS NULL;

        IF v_member_role IS NULL THEN
            RAISE EXCEPTION 'NOT_A_MEMBER';
        END IF;

        IF v_member_role = 'org_admin' THEN
            SELECT COUNT(*) INTO v_admin_count FROM org_members
            WHERE org_id = p_entity_id AND role = 'org_admin' AND deleted_at IS NULL;
            IF v_admin_count <= 1 THEN
                RAISE EXCEPTION 'LAST_ADMIN';
            END IF;
        END IF;

        UPDATE org_members SET deleted_at = now(), updated_at = now()
        WHERE org_id = p_entity_id AND user_id = p_user_id AND deleted_at IS NULL;

    ELSIF p_entity_type = 'institute' THEN
        SELECT role INTO v_member_role FROM institute_members
        WHERE institute_id = p_entity_id AND user_id = p_user_id AND deleted_at IS NULL;

        IF v_member_role IS NULL THEN
            RAISE EXCEPTION 'NOT_A_MEMBER';
        END IF;

        IF v_member_role = 'institute_admin' THEN
            SELECT COUNT(*) INTO v_admin_count FROM institute_members
            WHERE institute_id = p_entity_id AND role = 'institute_admin' AND deleted_at IS NULL;
            IF v_admin_count <= 1 THEN
                RAISE EXCEPTION 'LAST_ADMIN';
            END IF;
        END IF;

        UPDATE institute_members SET deleted_at = now(), updated_at = now()
        WHERE institute_id = p_entity_id AND user_id = p_user_id AND deleted_at IS NULL;
    END IF;

    -- Check if user has other active memberships
    SELECT EXISTS (
        SELECT 1 FROM org_members WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT 1 FROM institute_members WHERE user_id = p_user_id AND deleted_at IS NULL
    ) INTO v_has_other_memberships;

    -- Revert role to learner if no other memberships
    IF NOT v_has_other_memberships THEN
        UPDATE profiles SET role = 'learner', updated_at = now() WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'removed', true,
        'user_id', p_user_id,
        'previous_role', v_member_role,
        'role_reverted', NOT v_has_other_memberships
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire stale invitations (called by cron)
CREATE OR REPLACE FUNCTION expire_stale_invitations()
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE invitations
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending' AND expires_at < now();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
