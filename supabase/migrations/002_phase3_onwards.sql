-- ============================================================
-- COBROKINGS — Extended Schema (Phase 3 onwards)
-- Tables already in the DB — committed here so the repo matches.
-- Covers: Mandate analytics · Co-Broking · Transactions · CRM
-- Run in: Supabase Dashboard → SQL Editor
-- (Only needed by new devs setting up from scratch)
-- ============================================================


-- ============================================================
-- SECTION 1: MANDATE ANALYTICS
-- ============================================================

-- ─── Mandate views (per-view analytics) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS mandate_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  viewer_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Saved searches ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_searches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL DEFAULT 'Saved Search',
  filters      JSONB NOT NULL DEFAULT '{}',
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_push  BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 2: CO-BROKING TABLES
-- ============================================================

-- ─── Introductions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS introductions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id           UUID NOT NULL REFERENCES mandates(id),
  requester_id         UUID NOT NULL REFERENCES profiles(id),
  responder_id         UUID NOT NULL REFERENCES profiles(id),
  requester_company_id UUID REFERENCES companies(id),
  responder_company_id UUID REFERENCES companies(id),
  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  message              TEXT,
  rejection_reason     TEXT,
  responded_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mandate_id, requester_id)
);

CREATE OR REPLACE FUNCTION public.set_updated_at_introductions()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_introductions_updated_at
  BEFORE UPDATE ON introductions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Deals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id          UUID REFERENCES introductions(id),
  mandate_id               UUID REFERENCES mandates(id),
  title                    VARCHAR(255) NOT NULL DEFAULT 'Untitled Deal',
  stage                    VARCHAR(30) NOT NULL DEFAULT 'lead'
                           CHECK (stage IN (
                             'lead','introduction','meeting','site_visit',
                             'negotiation','token','agreement','registration','completed'
                           )),
  property_address         TEXT,
  deal_value               BIGINT,
  brokerage_percentage     DECIMAL(5,2),
  commission_split_broker1 DECIMAL(5,2),
  commission_split_broker2 DECIMAL(5,2),
  broker1_id               UUID REFERENCES profiles(id),
  broker2_id               UUID REFERENCES profiles(id),
  company1_id              UUID REFERENCES companies(id),
  company2_id              UUID REFERENCES companies(id),
  expected_close_date      DATE,
  actual_close_date        DATE,
  notes                    TEXT,
  is_archived              BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Deal stage history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage VARCHAR(30),
  to_stage   VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Deal notes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 3: TRANSACTION TABLES
-- ============================================================

-- ─── Deal documents ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id        UUID REFERENCES deals(id) ON DELETE SET NULL,
  name           VARCHAR(255) NOT NULL,
  type           VARCHAR(50)
                 CHECK (type IN ('nda','loi','mou','agreement','registration',
                                 'co_broking_agreement','title_deed','floor_plan','brochure','other')),
  url            TEXT NOT NULL,
  version        INT NOT NULL DEFAULT 1,
  uploaded_by    UUID REFERENCES profiles(id),
  is_shared      BOOLEAN NOT NULL DEFAULT true,
  is_signed      BOOLEAN NOT NULL DEFAULT false,
  signature_data JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Subscription plans ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  price        BIGINT NOT NULL,          -- in paise (INR × 100)
  interval     VARCHAR(20) NOT NULL
               CHECK (interval IN ('monthly','quarterly','annual')),
  features     JSONB DEFAULT '[]',
  max_mandates INT,
  max_members  INT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Subscriptions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id               UUID NOT NULL REFERENCES companies(id),
  plan_id                  UUID NOT NULL REFERENCES subscription_plans(id),
  status                   VARCHAR(20) NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled','expired','past_due')),
  razorpay_subscription_id TEXT,
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID REFERENCES companies(id),
  user_id             UUID REFERENCES profiles(id),
  type                VARCHAR(30)
                      CHECK (type IN ('subscription','commission','brokerage')),
  amount              BIGINT NOT NULL,   -- in paise
  currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
  status              VARCHAR(20)
                      CHECK (status IN ('pending','captured','failed','refunded')),
  razorpay_payment_id TEXT,
  razorpay_order_id   TEXT,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Invoices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  deal_id         UUID REFERENCES deals(id),
  from_company_id UUID REFERENCES companies(id),
  to_company_id   UUID REFERENCES companies(id),
  type            VARCHAR(20)
                  CHECK (type IN ('commission','subscription','receipt')),
  subtotal        BIGINT,
  gst_percentage  DECIMAL(5,2) DEFAULT 18.00,
  gst_amount      BIGINT,
  total           BIGINT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','paid')),
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 4: CRM TABLES
-- ============================================================

-- ─── Leads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES companies(id),
  assigned_to          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name                 VARCHAR(255) NOT NULL,
  phone                VARCHAR(20),
  email                VARCHAR(255),
  source               VARCHAR(50)
                       CHECK (source IN ('manual','website','referral','cold_call','whatsapp','other')),
  requirement          TEXT,
  budget_min           BIGINT,
  budget_max           BIGINT,
  city                 VARCHAR(100),
  status               VARCHAR(30) NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new','contacted','qualified','negotiation','converted','lost')),
  priority             VARCHAR(10) NOT NULL DEFAULT 'medium'
                       CHECK (priority IN ('low','medium','high')),
  notes                TEXT,
  converted_to_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  created_by           UUID REFERENCES profiles(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Contacts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id),
  type         VARCHAR(20)
               CHECK (type IN ('company','broker','client','investor')),
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(20),
  email        VARCHAR(255),
  organization VARCHAR(255),
  notes        TEXT,
  tags         TEXT[],
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Audit logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 5: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_introductions_requester ON introductions(requester_id);
CREATE INDEX IF NOT EXISTS idx_introductions_responder ON introductions(responder_id);
CREATE INDEX IF NOT EXISTS idx_introductions_mandate   ON introductions(mandate_id);
CREATE INDEX IF NOT EXISTS idx_introductions_status    ON introductions(status);

CREATE INDEX IF NOT EXISTS idx_deals_broker1  ON deals(broker1_id);
CREATE INDEX IF NOT EXISTS idx_deals_broker2  ON deals(broker2_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage    ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_company1 ON deals(company1_id);
CREATE INDEX IF NOT EXISTS idx_deals_company2 ON deals(company2_id);

CREATE INDEX IF NOT EXISTS idx_leads_company  ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(status);

CREATE INDEX IF NOT EXISTS idx_audit_user       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);


-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE mandate_views      ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- ─── Saved searches ───────────────────────────────────────────────────────────
CREATE POLICY "Users manage own saved searches"
  ON saved_searches FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Introductions ────────────────────────────────────────────────────────────
CREATE POLICY "Users see own introductions"
  ON introductions FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR responder_id = auth.uid());

CREATE POLICY "Users can create introductions"
  ON introductions FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Parties can update introduction status"
  ON introductions FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR responder_id = auth.uid());

-- ─── Deals ────────────────────────────────────────────────────────────────────
CREATE POLICY "Deal participants can view deals"
  ON deals FOR SELECT TO authenticated
  USING (broker1_id = auth.uid() OR broker2_id = auth.uid());

CREATE POLICY "Deal participants can update deals"
  ON deals FOR UPDATE TO authenticated
  USING (broker1_id = auth.uid() OR broker2_id = auth.uid());

CREATE POLICY "Authenticated users can create deals"
  ON deals FOR INSERT TO authenticated
  WITH CHECK (broker1_id = auth.uid() OR broker2_id = auth.uid());

-- ─── Deal stage history & notes ───────────────────────────────────────────────
CREATE POLICY "Deal participants see stage history"
  ON deal_stage_history FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM deals WHERE id = deal_id
            AND (broker1_id = auth.uid() OR broker2_id = auth.uid()))
  );

CREATE POLICY "Deal participants see notes"
  ON deal_notes FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM deals WHERE id = deal_id
            AND (broker1_id = auth.uid() OR broker2_id = auth.uid()))
  );

CREATE POLICY "Deal participants can add notes"
  ON deal_notes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM deals WHERE id = deal_id
            AND (broker1_id = auth.uid() OR broker2_id = auth.uid()))
  );

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE POLICY "Deal participants can view documents"
  ON documents FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM deals WHERE id = deal_id
            AND (broker1_id = auth.uid() OR broker2_id = auth.uid()))
  );

CREATE POLICY "Authenticated users can upload documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- ─── Subscription plans — public read ────────────────────────────────────────
CREATE POLICY "Subscription plans viewable by everyone"
  ON subscription_plans FOR SELECT USING (true);

-- ─── Leads ────────────────────────────────────────────────────────────────────
CREATE POLICY "Company members manage leads"
  ON leads FOR ALL TO authenticated
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ─── Contacts ─────────────────────────────────────────────────────────────────
CREATE POLICY "Company members manage contacts"
  ON contacts FOR ALL TO authenticated
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );
