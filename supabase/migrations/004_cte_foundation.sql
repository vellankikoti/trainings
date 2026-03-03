-- =============================================
-- CTE FOUNDATION — Career Transformation Engine
-- Migration 004: Extend profiles + add all new tables
-- =============================================
-- This migration extends the existing schema to support:
-- - Role-based access (7 roles)
-- - Institutes & batch management
-- - Organizations & recruiting
-- - Lab sessions & command tracking
-- - Incident simulations
-- - Skill scoring per domain
-- - Event store (append-only)
-- - Active time tracking
-- - Job postings & applications
-- =============================================

-- =============================================
-- 1. EXTEND PROFILES TABLE
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
    role TEXT NOT NULL DEFAULT 'learner'
        CHECK (role IN ('learner', 'trainer', 'institute_admin',
                        'recruiter', 'org_admin', 'admin', 'super_admin'));

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
-- 8. JOB POSTINGS & APPLICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'platform'
        CHECK (source IN ('platform', 'indeed', 'google', 'jsearch', 'adzuna', 'other')),
    external_id TEXT,
    external_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    company_name TEXT NOT NULL,
    location_city TEXT,
    location_country TEXT,
    is_remote BOOLEAN DEFAULT false,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    required_skills TEXT[] DEFAULT '{}',
    experience_years_min INTEGER,
    experience_years_max INTEGER,
    employment_type TEXT CHECK (employment_type IN (
        'full_time', 'part_time', 'contract', 'internship'
    )),
    is_active BOOLEAN NOT NULL DEFAULT true,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'viewed', 'shortlisted', 'contacted', 'rejected', 'hired')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, job_id)
);

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

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_jobs_location ON job_postings(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON job_postings USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON job_postings(source, is_active);
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);

-- Candidate interaction indexes
CREATE INDEX IF NOT EXISTS idx_candidate_interactions_org ON candidate_interactions(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_interactions_candidate ON candidate_interactions(candidate_id);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type, created_at DESC);

-- Active time indexes
CREATE INDEX IF NOT EXISTS idx_active_time_user ON active_time_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_time_entity ON active_time_log(entity_type, entity_id);

-- Profile role index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
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
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_time_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 13. RLS POLICIES
-- =============================================

-- Note: API routes use the admin client (service role key) which bypasses RLS.
-- These policies are for direct client access and defense-in-depth.

-- Institutes: viewable by members, admins can manage
CREATE POLICY "Institute members can view their institute"
    ON institutes FOR SELECT
    USING (id IN (
        SELECT institute_id FROM institute_members
        WHERE user_id = get_current_profile_id()
    ));

CREATE POLICY "Admins can manage institutes"
    ON institutes FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = get_current_profile_id()
        AND role IN ('admin', 'super_admin')
    ));

-- Institute members: visible to fellow members
CREATE POLICY "Institute members can view fellow members"
    ON institute_members FOR SELECT
    USING (institute_id IN (
        SELECT institute_id FROM institute_members
        WHERE user_id = get_current_profile_id()
    ));

-- Batches: visible to institute members
CREATE POLICY "Institute members can view batches"
    ON batches FOR SELECT
    USING (institute_id IN (
        SELECT institute_id FROM institute_members
        WHERE user_id = get_current_profile_id()
    ));

-- Batch enrollments: students see own, trainers see batch
CREATE POLICY "Users can view own enrollment"
    ON batch_enrollments FOR SELECT
    USING (user_id = get_current_profile_id());

CREATE POLICY "Institute members can view batch enrollments"
    ON batch_enrollments FOR SELECT
    USING (batch_id IN (
        SELECT b.id FROM batches b
        JOIN institute_members im ON im.institute_id = b.institute_id
        WHERE im.user_id = get_current_profile_id()
    ));

-- Organizations: viewable by members
CREATE POLICY "Org members can view their organization"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT org_id FROM org_members
        WHERE user_id = get_current_profile_id()
    ));

-- Org members: visible to fellow members
CREATE POLICY "Org members can view fellow members"
    ON org_members FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM org_members
        WHERE user_id = get_current_profile_id()
    ));

-- Lab sessions: own sessions only
CREATE POLICY "Users can manage own lab sessions"
    ON lab_sessions FOR ALL
    USING (user_id = get_current_profile_id());

-- Lab commands: through session ownership
CREATE POLICY "Users can view own lab commands"
    ON lab_commands FOR SELECT
    USING (session_id IN (
        SELECT id FROM lab_sessions
        WHERE user_id = get_current_profile_id()
    ));

-- Simulation definitions: readable by all authenticated users
CREATE POLICY "Authenticated users can view simulations"
    ON simulation_definitions FOR SELECT
    USING (is_active = true);

-- Simulation attempts: own attempts only
CREATE POLICY "Users can manage own simulation attempts"
    ON simulation_attempts FOR ALL
    USING (user_id = get_current_profile_id());

-- Skill scores: own scores readable, discoverable profiles visible to orgs
CREATE POLICY "Users can view own skill scores"
    ON skill_scores FOR SELECT
    USING (user_id = get_current_profile_id());

CREATE POLICY "Discoverable skill scores visible to org members"
    ON skill_scores FOR SELECT
    USING (user_id IN (
        SELECT id FROM profiles WHERE is_discoverable = true
    ) AND EXISTS (
        SELECT 1 FROM org_members WHERE user_id = get_current_profile_id()
    ));

-- Job postings: readable by all authenticated users when active
CREATE POLICY "Active job postings are readable"
    ON job_postings FOR SELECT
    USING (is_active = true);

CREATE POLICY "Org members can manage their job postings"
    ON job_postings FOR ALL
    USING (org_id IN (
        SELECT org_id FROM org_members
        WHERE user_id = get_current_profile_id()
    ));

-- Job applications: own applications only
CREATE POLICY "Users can manage own job applications"
    ON job_applications FOR ALL
    USING (user_id = get_current_profile_id());

-- Candidate interactions: org-scoped
CREATE POLICY "Org members can manage candidate interactions"
    ON candidate_interactions FOR ALL
    USING (org_id IN (
        SELECT org_id FROM org_members
        WHERE user_id = get_current_profile_id()
    ));

-- Events: own events only (insert via API with admin client)
CREATE POLICY "Users can view own events"
    ON events FOR SELECT
    USING (user_id = get_current_profile_id());

-- Active time log: own data only
CREATE POLICY "Users can manage own active time"
    ON active_time_log FOR ALL
    USING (user_id = get_current_profile_id());

-- =============================================
-- 14. UPDATED_AT TRIGGERS FOR NEW TABLES
-- =============================================

CREATE TRIGGER institutes_updated_at
    BEFORE UPDATE ON institutes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER batches_updated_at
    BEFORE UPDATE ON batches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER simulation_definitions_updated_at
    BEFORE UPDATE ON simulation_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
