-- ============================================================
-- COBROKINGS — Mandate Enquiries (public lead capture)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS mandate_enquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id   UUID REFERENCES mandates(id) ON DELETE SET NULL,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  message      TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mandate_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit an enquiry
CREATE POLICY "Anyone can submit enquiry"
  ON mandate_enquiries FOR INSERT WITH CHECK (true);

-- Only super_admin can read
CREATE POLICY "Admins can view enquiries"
  ON mandate_enquiries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- Only super_admin can update status
CREATE POLICY "Admins can update enquiry status"
  ON mandate_enquiries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_mandate_enquiries_mandate  ON mandate_enquiries(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_enquiries_status   ON mandate_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_mandate_enquiries_created  ON mandate_enquiries(created_at DESC);
