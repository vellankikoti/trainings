-- Migration 018: Add soft-delete column to profiles table
-- Required by profile.ts which filters on deleted_at IS NULL
-- Applied to production on 2026-03-06 via Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
