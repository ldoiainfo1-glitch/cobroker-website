-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Extended profile fields
-- Adds bio, years_of_experience, specializations, areas, languages,
-- linkedin_url, website_url to the profiles table.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio                TEXT,
  ADD COLUMN IF NOT EXISTS years_of_experience INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specializations     TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS areas               TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages           TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linkedin_url        TEXT,
  ADD COLUMN IF NOT EXISTS website_url         TEXT;
