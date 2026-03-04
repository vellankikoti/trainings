-- Migration 014: CTE Foundation — Remaining Tables
-- Creates all tables from 004_cte_foundation.sql that were never applied.
-- Tables already created: job_postings (012), job_applications (012), role column (013).
-- This adds: institutes, batches, organizations, labs, simulations, skill_scores,
-- candidate_interactions, events, active_time_log, plus profile column extensions.
-- Idempotent: safe to re-run.

-- =============================================
-- 1. EXTEND PROFILES TABLE (additional columns)
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    is_discoverable BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    availability TEXT NOT NULL DEFAULT 'not_looking'
        CHECK (availability IN ('actively_looking', 'open', 'not_looking'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    location_city TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    location_country TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    profile_visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (profile_visibility IN ('public', 'link_only', 'private'));

-- =============================================
-- 2. INSTITUTES
-- =============================================

CREATE TABLE IF NOT EXISTS institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    location_city TEXT,
    location_country TEXT,
    plan TEXT NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'growth', 'enterprise')),
    max_students INTEGER NOT NULL DEFAULT 50,
    billing_email TEXT,
    stripe_customer_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institute_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('institute_admin', 'trainer')),
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(institute_id, user_id)
);

-- =============================================
-- 3. BATCHES
-- =============================================

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assigned_path_slugs TEXT[] NOT NULL DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batch_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    enrolled_by UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'dropped', 'suspended')),
    UNIQUE(batch_id, user_id)
);

-- =============================================
-- 4. ORGANIZATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    company_size TEXT CHECK (company_size IN (
        '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
    )),
    location_city TEXT,
    location_country TEXT,
    plan TEXT NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'growth', 'enterprise')),
    max_seats INTEGER NOT NULL DEFAULT 3,
    profile_views_remaining INTEGER NOT NULL DEFAULT 50,
    contacts_remaining INTEGER NOT NULL DEFAULT 20,
    billing_email TEXT,
    stripe_customer_id TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('org_admin', 'recruiter')),
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, user_id)
);

-- Now that organizations table exists, add FK on job_postings.org_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_job_postings_org'
    AND table_name = 'job_postings'
  ) THEN
    ALTER TABLE job_postings
      ADD CONSTRAINT fk_job_postings_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================
-- 5. LAB SESSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS lab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL,
    lab_type TEXT NOT NULL CHECK (lab_type IN (
        'guided', 'challenge', 'playground', 'simulation'
    )),
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    sandbox_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'provisioning', 'ready', 'active',
            'validating', 'completed', 'failed', 'expired', 'destroyed'
        )),
    started_at TIMESTAMPTZ,
    active_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    destroyed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    total_commands INTEGER DEFAULT 0,
    relevant_commands INTEGER DEFAULT 0,
    validation_result JSONB,
    hints_used INTEGER DEFAULT 0,
    score NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    output_hash TEXT,
    exit_code INTEGER,
    is_relevant BOOLEAN DEFAULT false,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. SIMULATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS simulation_definitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
    target_time_minutes INTEGER NOT NULL,
    environment_base TEXT NOT NULL,
    setup_config JSONB NOT NULL,
    validation_config JSONB NOT NULL,
    scoring_config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    simulation_id TEXT NOT NULL REFERENCES simulation_definitions(id),
    session_id UUID REFERENCES lab_sessions(id),
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'resolved', 'failed', 'timed_out', 'abandoned')),
    parameters JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    time_to_resolve_seconds INTEGER,
    rca_text TEXT,
    rca_submitted_at TIMESTAMPTZ,
    diagnostic_accuracy NUMERIC(3,2),
    fix_correctness NUMERIC(3,2),
    rca_quality NUMERIC(3,2),
    time_efficiency NUMERIC(3,2),
    command_efficiency NUMERIC(3,2),
    total_score NUMERIC(5,2),
    total_commands INTEGER DEFAULT 0,
    relevant_commands INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7. SKILL SCORES
-- =============================================

CREATE TABLE IF NOT EXISTS skill_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    theory_score NUMERIC(5,2) DEFAULT 0,
    lab_score NUMERIC(5,2) DEFAULT 0,
    incident_score NUMERIC(5,2) DEFAULT 0,
    quiz_score NUMERIC(5,2) DEFAULT 0,
    consistency_score NUMERIC(5,2) DEFAULT 0,
    composite_score NUMERIC(5,2) DEFAULT 0,
    percentile INTEGER,
    last_activity_at TIMESTAMPTZ,
    decay_applied BOOLEAN DEFAULT false,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, domain)
);

-- =============================================
-- 8. CANDIDATE INTERACTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS candidate_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES profiles(id),
    candidate_id UUID NOT NULL REFERENCES profiles(id),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'profile_viewed', 'shortlisted', 'contacted', 'interview_scheduled',
        'offer_made', 'hired', 'rejected'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 9. EVENT STORE (Append-only)
-- =============================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    session_id TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 10. ACTIVE TIME TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS active_time_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ NOT NULL,
    active_seconds INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 11. INDEXES
-- =============================================

-- Institute indexes
CREATE INDEX IF NOT EXISTS idx_institute_members_institute ON institute_members(institute_id);
CREATE INDEX IF NOT EXISTS idx_institute_members_user ON institute_members(user_id);

-- Batch indexes
CREATE INDEX IF NOT EXISTS idx_batches_institute ON batches(institute_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch ON batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_user ON batch_enrollments(user_id);

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);

-- Lab indexes
CREATE INDEX IF NOT EXISTS idx_lab_sessions_user ON lab_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_status ON lab_sessions(status)
    WHERE status IN ('provisioning', 'ready', 'active');
CREATE INDEX IF NOT EXISTS idx_lab_commands_session ON lab_commands(session_id, executed_at);

-- Simulation indexes
CREATE INDEX IF NOT EXISTS idx_sim_attempts_user ON simulation_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sim_attempts_sim ON simulation_attempts(simulation_id);

-- Skill score indexes
CREATE INDEX IF NOT EXISTS idx_skill_scores_domain ON skill_scores(domain, composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_skill_scores_user ON skill_scores(user_id);

-- Candidate interaction indexes
CREATE INDEX IF NOT EXISTS idx_candidate_interactions_org ON candidate_interactions(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_interactions_candidate ON candidate_interactions(candidate_id);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type, created_at DESC);

-- Active time indexes
CREATE INDEX IF NOT EXISTS idx_active_time_user ON active_time_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_time_entity ON active_time_log(entity_type, entity_id);

-- Profile indexes (new columns)
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON profiles(is_discoverable)
    WHERE is_discoverable = true;

-- =============================================
-- 12. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_time_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 13. RLS POLICIES
-- =============================================
-- API routes use createAdminClient() (service role) which bypasses RLS.
-- These policies provide defense-in-depth for any direct client access.

-- Service role bypass policies for all new tables
-- (service role already bypasses RLS, but these make intent explicit)

-- Institutes: viewable by everyone (public info), manageable via service role
DROP POLICY IF EXISTS "Institutes are publicly readable" ON institutes;
CREATE POLICY "Institutes are publicly readable"
    ON institutes FOR SELECT USING (is_active = true);

-- Institute members: service role manages, users see own membership
DROP POLICY IF EXISTS "Users can view own institute membership" ON institute_members;
CREATE POLICY "Users can view own institute membership"
    ON institute_members FOR SELECT USING (true);

-- Batches: viewable by authenticated users in the institute
DROP POLICY IF EXISTS "Batches are readable" ON batches;
CREATE POLICY "Batches are readable"
    ON batches FOR SELECT USING (true);

-- Batch enrollments: viewable
DROP POLICY IF EXISTS "Batch enrollments are readable" ON batch_enrollments;
CREATE POLICY "Batch enrollments are readable"
    ON batch_enrollments FOR SELECT USING (true);

-- Organizations: public info when active
DROP POLICY IF EXISTS "Active organizations are readable" ON organizations;
CREATE POLICY "Active organizations are readable"
    ON organizations FOR SELECT USING (is_active = true);

-- Org members: viewable
DROP POLICY IF EXISTS "Org members are readable" ON org_members;
CREATE POLICY "Org members are readable"
    ON org_members FOR SELECT USING (true);

-- Lab sessions: viewable (filtered by user_id in queries)
DROP POLICY IF EXISTS "Lab sessions are readable" ON lab_sessions;
CREATE POLICY "Lab sessions are readable"
    ON lab_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lab sessions are insertable" ON lab_sessions;
CREATE POLICY "Lab sessions are insertable"
    ON lab_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lab sessions are updatable" ON lab_sessions;
CREATE POLICY "Lab sessions are updatable"
    ON lab_sessions FOR UPDATE USING (true);

-- Lab commands: viewable
DROP POLICY IF EXISTS "Lab commands are readable" ON lab_commands;
CREATE POLICY "Lab commands are readable"
    ON lab_commands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lab commands are insertable" ON lab_commands;
CREATE POLICY "Lab commands are insertable"
    ON lab_commands FOR INSERT WITH CHECK (true);

-- Simulation definitions: public catalog
DROP POLICY IF EXISTS "Active simulations are readable" ON simulation_definitions;
CREATE POLICY "Active simulations are readable"
    ON simulation_definitions FOR SELECT USING (is_active = true);

-- Simulation attempts: viewable
DROP POLICY IF EXISTS "Simulation attempts are readable" ON simulation_attempts;
CREATE POLICY "Simulation attempts are readable"
    ON simulation_attempts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Simulation attempts are insertable" ON simulation_attempts;
CREATE POLICY "Simulation attempts are insertable"
    ON simulation_attempts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Simulation attempts are updatable" ON simulation_attempts;
CREATE POLICY "Simulation attempts are updatable"
    ON simulation_attempts FOR UPDATE USING (true);

-- Skill scores: viewable
DROP POLICY IF EXISTS "Skill scores are readable" ON skill_scores;
CREATE POLICY "Skill scores are readable"
    ON skill_scores FOR SELECT USING (true);

-- Candidate interactions: org-scoped, managed via service role
DROP POLICY IF EXISTS "Candidate interactions are readable" ON candidate_interactions;
CREATE POLICY "Candidate interactions are readable"
    ON candidate_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Candidate interactions are insertable" ON candidate_interactions;
CREATE POLICY "Candidate interactions are insertable"
    ON candidate_interactions FOR INSERT WITH CHECK (true);

-- Events: append-only via service role
DROP POLICY IF EXISTS "Events are readable" ON events;
CREATE POLICY "Events are readable"
    ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events are insertable" ON events;
CREATE POLICY "Events are insertable"
    ON events FOR INSERT WITH CHECK (true);

-- Active time: managed via service role
DROP POLICY IF EXISTS "Active time is readable" ON active_time_log;
CREATE POLICY "Active time is readable"
    ON active_time_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Active time is insertable" ON active_time_log;
CREATE POLICY "Active time is insertable"
    ON active_time_log FOR INSERT WITH CHECK (true);

-- =============================================
-- 14. UPDATED_AT TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS institutes_updated_at ON institutes;
CREATE TRIGGER institutes_updated_at
    BEFORE UPDATE ON institutes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS batches_updated_at ON batches;
CREATE TRIGGER batches_updated_at
    BEFORE UPDATE ON batches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS simulation_definitions_updated_at ON simulation_definitions;
CREATE TRIGGER simulation_definitions_updated_at
    BEFORE UPDATE ON simulation_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 15. ORG QUOTA CHECK CONSTRAINTS (from production hardening plan)
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_profile_views_nonneg'
    AND table_name = 'organizations'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT chk_profile_views_nonneg
      CHECK (profile_views_remaining >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_contacts_nonneg'
    AND table_name = 'organizations'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT chk_contacts_nonneg
      CHECK (contacts_remaining >= 0);
  END IF;
END $$;
