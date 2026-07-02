-- ============================================================
-- Registration helper RPC
-- ============================================================
-- After supabase.auth.signUp(), when email confirmation is enabled
-- on the hosted project the client receives session=null, so the
-- anon key is still in use. Direct INSERT on `companies` and
-- UPDATE on `profiles` are both blocked by RLS for the anon role.
--
-- This SECURITY DEFINER function runs as the postgres role, bypassing
-- RLS, so it can be safely called immediately after signUp() before
-- the user has confirmed their email.
--
-- Security guards:
--  1. The profile row must exist (trigger fires on auth.users INSERT)
--  2. The profile must have no company_id yet (not already registered)
--  3. The profile must have been created within the last 15 minutes
--     (prevents any old user from being hijacked via this endpoint)
-- ============================================================

CREATE OR REPLACE FUNCTION public.complete_registration(
  p_user_id         UUID,
  p_full_name       TEXT,
  p_phone           TEXT,
  p_company_name    TEXT,
  p_company_city    TEXT,
  p_company_state   TEXT,
  p_company_slug    TEXT,
  p_company_address TEXT    DEFAULT NULL,
  p_company_website TEXT    DEFAULT NULL,
  p_introducer_phone TEXT   DEFAULT NULL
)
RETURNS UUID   -- returns the new company id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id     UUID;
  v_introducer_id  UUID;
BEGIN
  -- ── Security check ──────────────────────────────────────────
  -- Must be a brand-new profile (no company yet, created recently)
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id         = p_user_id
      AND company_id IS NULL
      AND created_at > now() - INTERVAL '15 minutes'
  ) THEN
    RAISE EXCEPTION 'complete_registration: invalid or already-registered user_id';
  END IF;

  -- ── Create company ───────────────────────────────────────────
  INSERT INTO companies (name, slug, city, state, address, website, verification_status)
  VALUES (
    p_company_name,
    p_company_slug,
    p_company_city,
    p_company_state,
    p_company_address,
    p_company_website,
    'pending'
  )
  RETURNING id INTO v_company_id;

  -- ── Update profile ────────────────────────────────────────────
  UPDATE profiles
  SET
    full_name  = p_full_name,
    phone      = p_phone,
    company_id = v_company_id,
    role       = 'company_admin'
  WHERE id = p_user_id;

  -- ── Link introducer (non-critical) ────────────────────────────
  IF p_introducer_phone IS NOT NULL AND trim(p_introducer_phone) <> '' THEN
    SELECT id INTO v_introducer_id
    FROM profiles
    WHERE phone = trim(p_introducer_phone)
    LIMIT 1;

    IF v_introducer_id IS NOT NULL THEN
      UPDATE profiles
      SET introducer_id = v_introducer_id
      WHERE id = p_user_id;
    END IF;
  END IF;

  RETURN v_company_id;
END;
$$;

-- Allow both anon (pre-confirmation) and authenticated callers
GRANT EXECUTE ON FUNCTION public.complete_registration TO anon, authenticated;
