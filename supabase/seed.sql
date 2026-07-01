-- ============================================================
-- COBROKINGS — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── Property categories ──────────────────────────────────────────────────────
-- Used by PostMandatePage step 1 (type & category selector)
INSERT INTO property_categories (name, slug, icon) VALUES
  ('Residential',  'residential',  '🏠'),
  ('Commercial',   'commercial',   '🏢'),
  ('Industrial',   'industrial',   '🏭'),
  ('Land / Plot',  'land',         '🌍'),
  ('Agricultural', 'agricultural', '🌾')
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Residential
INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Apartment',    'apartment',    '🏠', id FROM property_categories WHERE slug = 'residential'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Villa',        'villa',        '🏡', id FROM property_categories WHERE slug = 'residential'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Row House',    'row-house',    '🏘️', id FROM property_categories WHERE slug = 'residential'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Penthouse',    'penthouse',    '🏙️', id FROM property_categories WHERE slug = 'residential'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Studio',       'studio',       '🛏️', id FROM property_categories WHERE slug = 'residential'
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Commercial
INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Office Space', 'office',       '💼', id FROM property_categories WHERE slug = 'commercial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Retail / Shop','retail',       '🛍️', id FROM property_categories WHERE slug = 'commercial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Showroom',     'showroom',     '🚗', id FROM property_categories WHERE slug = 'commercial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Co-working',   'co-working',   '💻', id FROM property_categories WHERE slug = 'commercial'
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories under Industrial
INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Warehouse',    'warehouse',    '📦', id FROM property_categories WHERE slug = 'industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Factory',      'factory',      '🏭', id FROM property_categories WHERE slug = 'industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO property_categories (name, slug, icon, parent_id)
SELECT 'Cold Storage', 'cold-storage', '❄️', id FROM property_categories WHERE slug = 'industrial'
ON CONFLICT (slug) DO NOTHING;


-- ─── Circles ──────────────────────────────────────────────────────────────────
-- Used by CirclesPage and CircleDetailPage
INSERT INTO circles (name, slug, scope, city, state, asset_classes, description, is_featured) VALUES
  ('Mumbai Residential Brokers', 'mumbai-residential', 'city', 'Mumbai', 'Maharashtra', ARRAY['residential'], 'Mumbai residential mandate sharing circle', true),
  ('Delhi NCR Commercial Brokers', 'delhi-ncr-commercial', 'city', 'Delhi', 'Delhi', ARRAY['commercial'], 'NCR commercial mandate sharing circle', true),
  ('Bangalore Tech Park Brokers', 'bangalore-tech-park', 'city', 'Bangalore', 'Karnataka', ARRAY['commercial','office'], 'Bangalore IT corridor brokers', true),
  ('Pune Residential Circle', 'pune-residential', 'city', 'Pune', 'Maharashtra', ARRAY['residential'], 'Pune residential brokers network', true),
  ('Hyderabad Growth Corridors', 'hyderabad-growth', 'city', 'Hyderabad', 'Telangana', ARRAY['residential','commercial'], 'Hyderabad HITEC City and growth corridors', false),
  ('Chennai Property Network', 'chennai-property', 'city', 'Chennai', 'Tamil Nadu', ARRAY['residential','commercial'], 'Chennai real estate broker network', false),
  ('Industrial & Warehouse India', 'india-industrial', 'national', NULL, NULL, ARRAY['industrial','warehouse'], 'National industrial and logistics property network', false),
  ('Land & JV Opportunities', 'india-land-jv', 'national', NULL, NULL, ARRAY['land','joint_venture'], 'Land acquisition and JV deals across India', false)
ON CONFLICT (slug) DO NOTHING;


-- ─── Subscription plans ───────────────────────────────────────────────────────
-- Requires 002_phase3_onwards.sql to be run first
INSERT INTO subscription_plans (name, price, interval, features, max_mandates, max_members) VALUES
(
  'Starter',
  0,
  'monthly',
  '["5 active mandates","Basic profile","Marketplace access","Email support"]'::jsonb,
  5,
  1
),
(
  'Pro',
  299900,
  'monthly',
  '["50 active mandates","Verified badge","Priority listing","Chat & introductions","Deal pipeline","GST invoices","Phone support"]'::jsonb,
  50,
  10
),
(
  'Business',
  799900,
  'monthly',
  '["Unlimited mandates","Team of up to 50","Advanced analytics","CRM tools","API access","Dedicated account manager"]'::jsonb,
  NULL,
  50
),
(
  'Enterprise',
  0,
  'annual',
  '["Everything in Business","Unlimited team members","White-label options","Custom integrations","SLA guarantee"]'::jsonb,
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;
