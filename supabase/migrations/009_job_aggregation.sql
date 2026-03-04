-- Migration 009: Job Aggregation Support
-- Adds unique constraint for dedup and expands source types
-- Idempotent: safe to re-run.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_postings') THEN
    -- Drop the old CHECK constraint on source
    ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_source_check;

    -- Add expanded CHECK constraint with new providers
    -- (safe: DROP above ensures this won't conflict)
    ALTER TABLE job_postings ADD CONSTRAINT job_postings_source_check
        CHECK (source IN ('platform', 'indeed', 'google', 'jsearch', 'adzuna', 'remotive', 'arbeitnow', 'other'));

    -- Add unique constraint for deduplication (source + external_id)
    -- Only applies to non-null external_id (platform postings don't have one)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_source_external_id
        ON job_postings(source, external_id)
        WHERE external_id IS NOT NULL;

    -- Allow org_id to be nullable for aggregated jobs (they don't belong to an org)
    -- (Already nullable in the schema, just confirming)
    COMMENT ON COLUMN job_postings.org_id IS 'NULL for aggregated external jobs, set for org-posted jobs';
  END IF;
END $$;
