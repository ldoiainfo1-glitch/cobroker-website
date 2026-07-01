-- ============================================================
-- COBROKINGS — Introducer / Referral Network (Migration 005)
-- Adds introducer_id to profiles for tracking the referral tree
-- ============================================================

-- ─── Add introducer_id column ─────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS introducer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- ─── Index for efficient tree queries ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_introducer_id ON profiles(introducer_id);
