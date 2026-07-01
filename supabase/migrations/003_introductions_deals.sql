-- ============================================================
-- COBROKINGS — Introductions + Deal Pipeline (Phase 4)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Introductions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS introductions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id    UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responder_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message       TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate pending intro from same broker for same mandate
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_intro
  ON introductions (mandate_id, requester_id)
  WHERE status NOT IN ('rejected','withdrawn');

CREATE TRIGGER set_introductions_updated_at
  BEFORE UPDATE ON introductions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Deals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id     UUID REFERENCES introductions(id) ON DELETE SET NULL,
  mandate_id          UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  broker1_id          UUID NOT NULL REFERENCES profiles(id),
  broker2_id          UUID NOT NULL REFERENCES profiles(id),
  stage               VARCHAR(30) NOT NULL DEFAULT 'introduction'
                      CHECK (stage IN (
                        'lead','introduction','meeting','site_visit',
                        'negotiation','token','agreement','registration','completed'
                      )),
  deal_value          BIGINT,
  brokerage_pct       DECIMAL(5,2),
  commission_split_1  INT NOT NULL DEFAULT 50,
  commission_split_2  INT NOT NULL DEFAULT 50,
  expected_close_date DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_deals_updated_at
  BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Deal Stage History ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  stage      VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE introductions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;

-- Introductions: visible to requester or responder
CREATE POLICY "Intro parties can view"
  ON introductions FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = responder_id);

CREATE POLICY "Requester can insert"
  ON introductions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Responder can update status"
  ON introductions FOR UPDATE TO authenticated
  USING (auth.uid() = responder_id OR auth.uid() = requester_id);

-- Deals: visible to broker1 or broker2
CREATE POLICY "Deal brokers can view"
  ON deals FOR SELECT TO authenticated
  USING (auth.uid() = broker1_id OR auth.uid() = broker2_id);

CREATE POLICY "Deal brokers can insert"
  ON deals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = broker1_id OR auth.uid() = broker2_id);

CREATE POLICY "Deal brokers can update"
  ON deals FOR UPDATE TO authenticated
  USING (auth.uid() = broker1_id OR auth.uid() = broker2_id);

-- Deal stage history: deal brokers can view
CREATE POLICY "Deal brokers can view history"
  ON deal_stage_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_id
        AND (deals.broker1_id = auth.uid() OR deals.broker2_id = auth.uid())
    )
  );

CREATE POLICY "Deal brokers can insert history"
  ON deal_stage_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_id
        AND (deals.broker1_id = auth.uid() OR deals.broker2_id = auth.uid())
    )
  );

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_introductions_requester ON introductions(requester_id);
CREATE INDEX IF NOT EXISTS idx_introductions_responder ON introductions(responder_id);
CREATE INDEX IF NOT EXISTS idx_introductions_mandate   ON introductions(mandate_id);
CREATE INDEX IF NOT EXISTS idx_introductions_status    ON introductions(status);
CREATE INDEX IF NOT EXISTS idx_deals_broker1           ON deals(broker1_id);
CREATE INDEX IF NOT EXISTS idx_deals_broker2           ON deals(broker2_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage             ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deal_history_deal       ON deal_stage_history(deal_id);
