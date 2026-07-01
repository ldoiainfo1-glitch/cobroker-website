-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Admin KYC Policies + Auto-verify trigger
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── kyc_documents: Admin SELECT ─────────────────────────────────────────────

CREATE POLICY "super_admin can view all kyc docs"
  ON kyc_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─── kyc_documents: User UPDATE (re-upload) ──────────────────────────────────

CREATE POLICY "users can update own kyc docs"
  ON kyc_documents FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── kyc_documents: Admin UPDATE (approve / reject) ──────────────────────────

CREATE POLICY "super_admin can update kyc doc status"
  ON kyc_documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─── Auto-verify: sync profiles.is_verified ──────────────────────────────────
-- Fires after every INSERT or status UPDATE on kyc_documents.
-- Sets is_verified = TRUE when all 3 required doc types (rera, pan, address_proof)
-- have status = 'approved'.  Reverts to FALSE as soon as any required doc is
-- rejected or deleted.

CREATE OR REPLACE FUNCTION public.sync_profile_is_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER           -- runs as the function owner, bypasses RLS
SET search_path = public   -- prevent search_path hijacking
AS $$
DECLARE
  v_required_types TEXT[]  := ARRAY['rera', 'pan', 'address_proof'];
  v_approved_count INT;
BEGIN
  -- Count required doc types that currently have status = 'approved'
  SELECT COUNT(*) INTO v_approved_count
  FROM kyc_documents
  WHERE user_id = NEW.user_id
    AND type  = ANY(v_required_types)
    AND status = 'approved';

  -- Flip is_verified: TRUE only when all 3 are approved
  UPDATE profiles
  SET is_verified = (v_approved_count = array_length(v_required_types, 1))
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER kyc_doc_status_changed
  AFTER INSERT OR UPDATE OF status ON kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_is_verified();
