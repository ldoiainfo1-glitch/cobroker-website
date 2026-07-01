-- ============================================================
-- COBROKINGS — Database Schema (Phase 0–1 scope)
-- Covers only tables used by pages currently built in the frontend.
-- Future phases (deals, payments, CRM) get their own migrations.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- trigram search on mandate titles


-- ============================================================
-- SECTION 1: CORE TABLES
-- Pages: RegisterPage, LoginPage, ProfilePage, BrokerProfilePage,
--        CompanyProfilePage, KYCPage, DashboardHome
-- ============================================================

-- ─── Companies ────────────────────────────────────────────────────────────────
-- Created first because profiles.company_id references it
CREATE TABLE IF NOT EXISTS companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) UNIQUE NOT NULL,
  logo_url            TEXT,
  cover_url           TEXT,
  description         TEXT,
  website             VARCHAR(255),
  phone               VARCHAR(20),
  email               VARCHAR(255),
  address             TEXT,
  city                VARCHAR(100) NOT NULL DEFAULT '',
  state               VARCHAR(100) NOT NULL DEFAULT '',
  pincode             VARCHAR(10),
  rera_number         VARCHAR(50),
  gst_number          VARCHAR(20),
  pan_number          VARCHAR(20),
  company_reg_number  VARCHAR(50),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (verification_status IN ('unverified','pending','under_review','verified','rejected')),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- Mirrors auth.users — auto-populated by trigger on every signup
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(20),
  full_name    VARCHAR(255) NOT NULL DEFAULT '',
  avatar_url   TEXT,
  role         VARCHAR(50) NOT NULL DEFAULT 'broker'
               CHECK (role IN ('super_admin','company_admin','director','broker','employee','viewer')),
  company_id   UUID REFERENCES companies(id) ON DELETE SET NULL,
  is_verified  BOOLEAN NOT NULL DEFAULT false,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Trigger: auto-create profile on auth signup ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Trigger: auto-update updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Company: followers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_follows (
  follower_id UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, company_id)
);

-- ─── Company: certifications (RERA, ISO, etc.) ───────────────────────────────
CREATE TABLE IF NOT EXISTS company_certifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  issuing_body VARCHAR(100),
  issued_at    DATE,
  expires_at   DATE,
  doc_url      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Company: services / specialisations (tags) ───────────────────────────────
CREATE TABLE IF NOT EXISTS company_services (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service    VARCHAR(100) NOT NULL,
  PRIMARY KEY (company_id, service)
);

-- ─── KYC documents ────────────────────────────────────────────────────────────
-- Page: KYCPage
CREATE TABLE IF NOT EXISTS kyc_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,  -- aadhaar, pan, rera, gst
  doc_url     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','under_review','approved','rejected')),
  notes       TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 2: MANDATE TABLES
-- Pages: MarketplacePage, MandateDetailPage, MandatesPage,
--        PostMandatePage (6-step wizard), ListPropertyPage
-- ============================================================

-- ─── Property categories ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) UNIQUE NOT NULL,
  icon      TEXT,
  parent_id UUID REFERENCES property_categories(id)
);

-- ─── Mandates ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mandates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  mandate_type   VARCHAR(20) NOT NULL
                 CHECK (mandate_type IN ('buy','sell','lease','joint_venture','investment')),
  category_id    UUID REFERENCES property_categories(id),
  property_type  VARCHAR(50)
                 CHECK (property_type IN ('residential','commercial','industrial','land','agricultural')),
  bedrooms       INT,
  bathrooms      INT,
  min_budget     BIGINT,
  max_budget     BIGINT,
  is_negotiable  BOOLEAN DEFAULT true,
  commission_pct DECIMAL(5,2),
  min_area       DECIMAL(10,2),
  max_area       DECIMAL(10,2),
  area_unit      VARCHAR(10) DEFAULT 'sqft'
                 CHECK (area_unit IN ('sqft','sqm','acre','gunta','cents')),
  furnishing     VARCHAR(20)
                 CHECK (furnishing IN ('unfurnished','semi_furnished','fully_furnished')),
  floor          INT,
  total_floors   INT,
  amenities      TEXT[],
  city           VARCHAR(100) NOT NULL DEFAULT '',
  state          VARCHAR(100) NOT NULL DEFAULT '',
  locations      JSONB DEFAULT '[]',  -- micro-location tags
  latitude       DECIMAL(10,8),
  longitude      DECIMAL(11,8),
  landmark       TEXT,
  tags           TEXT[],
  status         VARCHAR(20) NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','active','closed','expired')),
  expires_at     TIMESTAMPTZ,
  views_count    INT NOT NULL DEFAULT 0,
  intro_count    INT NOT NULL DEFAULT 0,
  posted_by      UUID NOT NULL REFERENCES profiles(id),
  company_id     UUID NOT NULL REFERENCES companies(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_mandates_updated_at
  BEFORE UPDATE ON mandates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Mandate: images ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mandate_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Mandate: documents ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mandate_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  url        TEXT NOT NULL,
  file_type  VARCHAR(50),
  file_size  INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 3: COMMUNICATION TABLES
-- Pages: ChatPage, NotificationsPage, CirclesPage, CircleDetailPage
-- ============================================================

-- ─── Conversations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       VARCHAR(20) NOT NULL DEFAULT 'direct'
             CHECK (type IN ('direct','company_group','deal_group')),
  name       VARCHAR(255),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Conversation participants ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  content         TEXT,
  type            VARCHAR(20) NOT NULL DEFAULT 'text'
                  CHECK (type IN ('text','image','file','voice')),
  file_url        TEXT,
  file_name       TEXT,
  file_size       INT,
  is_edited       BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Circles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  scope         VARCHAR(20) NOT NULL DEFAULT 'city'
                CHECK (scope IN ('area','city','state','national')),
  city          VARCHAR(100),
  state         VARCHAR(100),
  asset_classes TEXT[],
  description   TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Circle members ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id UUID NOT NULL REFERENCES circles(id)  ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);


-- ============================================================
-- SECTION 4: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_companies_slug         ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_city         ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_verification ON companies(verification_status);

CREATE INDEX IF NOT EXISTS idx_mandates_status        ON mandates(status);
CREATE INDEX IF NOT EXISTS idx_mandates_posted_by     ON mandates(posted_by);
CREATE INDEX IF NOT EXISTS idx_mandates_company_id    ON mandates(company_id);
CREATE INDEX IF NOT EXISTS idx_mandates_city          ON mandates(city);
CREATE INDEX IF NOT EXISTS idx_mandates_type          ON mandates(mandate_type);
CREATE INDEX IF NOT EXISTS idx_mandates_property_type ON mandates(property_type);
CREATE INDEX IF NOT EXISTS idx_mandates_created_at    ON mandates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mandates_title_trgm    ON mandates USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;


-- ============================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_follows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_certifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandates                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandate_images            ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandate_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members            ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY "Profiles viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ─── Companies ────────────────────────────────────────────────────────────────
CREATE POLICY "Companies viewable by everyone"
  ON companies FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Company admins can update their company"
  ON companies FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.company_id = companies.id
        AND profiles.role IN ('company_admin','director','super_admin')
    )
  );

-- ─── Company certifications ───────────────────────────────────────────────────
CREATE POLICY "Company certs viewable by everyone"
  ON company_certifications FOR SELECT USING (true);

CREATE POLICY "Company admins can manage certs"
  ON company_certifications FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.company_id = company_certifications.company_id
        AND profiles.role IN ('company_admin','director','super_admin')
    )
  );

-- ─── Company services ─────────────────────────────────────────────────────────
CREATE POLICY "Company services viewable by everyone"
  ON company_services FOR SELECT USING (true);

-- ─── Company follows ──────────────────────────────────────────────────────────
CREATE POLICY "Company follows viewable by authenticated users"
  ON company_follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow/unfollow companies"
  ON company_follows FOR ALL TO authenticated
  USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());

-- ─── KYC documents ────────────────────────────────────────────────────────────
CREATE POLICY "Users see own KYC docs"
  ON kyc_documents FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can upload KYC docs"
  ON kyc_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ─── Property categories ──────────────────────────────────────────────────────
CREATE POLICY "Property categories viewable by everyone"
  ON property_categories FOR SELECT USING (true);

-- ─── Mandates ─────────────────────────────────────────────────────────────────
CREATE POLICY "Active mandates viewable by everyone"
  ON mandates FOR SELECT
  USING (status = 'active' OR posted_by = auth.uid());

CREATE POLICY "Users can create mandates"
  ON mandates FOR INSERT TO authenticated WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Users can update own mandates"
  ON mandates FOR UPDATE TO authenticated USING (posted_by = auth.uid());

CREATE POLICY "Users can delete own mandates"
  ON mandates FOR DELETE TO authenticated USING (posted_by = auth.uid());

-- ─── Mandate images ───────────────────────────────────────────────────────────
CREATE POLICY "Mandate images viewable by everyone"
  ON mandate_images FOR SELECT USING (true);

CREATE POLICY "Mandate owners can insert images"
  ON mandate_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM mandates WHERE id = mandate_id AND posted_by = auth.uid())
  );

CREATE POLICY "Mandate owners can delete images"
  ON mandate_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM mandates WHERE id = mandate_id AND posted_by = auth.uid())
  );

-- ─── Mandate documents ────────────────────────────────────────────────────────
CREATE POLICY "Mandate documents viewable by everyone"
  ON mandate_documents FOR SELECT USING (true);

CREATE POLICY "Mandate owners can upload documents"
  ON mandate_documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM mandates WHERE id = mandate_id AND posted_by = auth.uid())
  );

-- ─── Conversations ────────────────────────────────────────────────────────────
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view conversation members"
  ON conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can mark notifications as read"
  ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ─── Circles ──────────────────────────────────────────────────────────────────
CREATE POLICY "Circles viewable by everyone"
  ON circles FOR SELECT USING (true);

CREATE POLICY "Circle members viewable by authenticated users"
  ON circle_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join circles"
  ON circle_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave circles"
  ON circle_members FOR DELETE TO authenticated USING (user_id = auth.uid());

