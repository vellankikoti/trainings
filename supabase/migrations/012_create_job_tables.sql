-- Migration 012: Create Job Postings & Applications Tables
-- These tables were defined in 004_cte_foundation.sql but that migration
-- was never applied to production. This standalone migration creates them
-- without the organizations dependency.
-- Idempotent: safe to re-run.

-- 1. Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,  -- nullable, no FK to organizations (table may not exist yet)
    source TEXT NOT NULL DEFAULT 'platform'
        CHECK (source IN ('platform', 'indeed', 'google', 'jsearch', 'adzuna', 'remotive', 'arbeitnow', 'other')),
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

-- 2. Job Applications Table
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

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_location ON job_postings(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON job_postings USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON job_postings(source, is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON job_postings(posted_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);

-- Dedup index from 009_job_aggregation (source + external_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_source_external_id
    ON job_postings(source, external_id)
    WHERE external_id IS NOT NULL;

-- 4. RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Job postings: readable by all authenticated users when active
DROP POLICY IF EXISTS "Active job postings are readable" ON job_postings;
CREATE POLICY "Active job postings are readable"
    ON job_postings FOR SELECT
    USING (is_active = true);

-- Job postings: service role can insert/update (for aggregation cron)
DROP POLICY IF EXISTS "Service role manages job postings" ON job_postings;
CREATE POLICY "Service role manages job postings"
    ON job_postings FOR ALL
    USING (true)
    WITH CHECK (true);

-- Job applications: users can see and create their own applications
DROP POLICY IF EXISTS "Users can manage own job applications" ON job_applications;
CREATE POLICY "Users can manage own job applications"
    ON job_applications FOR ALL
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = job_applications.user_id AND profiles.clerk_id = auth.uid()::text
    ));

-- 5. Updated_at trigger for job_applications
DROP TRIGGER IF EXISTS job_applications_updated_at ON job_applications;
CREATE TRIGGER job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
