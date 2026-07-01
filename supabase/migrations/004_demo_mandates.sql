-- ============================================================
-- COBROKINGS — Demo Mandates Seed
-- Run in: Supabase Dashboard → SQL Editor
-- Requires: 001_initial_schema.sql already applied
-- Uses the first existing profile as the posted_by user.
-- ============================================================

-- ─── Demo companies ───────────────────────────────────────────────────────────
INSERT INTO companies (id, name, slug, city, state, verification_status, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Lodha Capital Partners',  'lodha-capital-partners',  'Mumbai',      'Maharashtra', 'verified', true),
  ('22222222-2222-2222-2222-222222222222', 'Oberoi Realty',           'oberoi-realty',           'Mumbai',      'Maharashtra', 'verified', true),
  ('33333333-3333-3333-3333-333333333333', 'DLF Commercial',          'dlf-commercial',          'Delhi',       'Delhi',       'verified', true),
  ('44444444-4444-4444-4444-444444444444', 'Godrej Properties',       'godrej-properties',       'Mumbai',      'Maharashtra', 'verified', true),
  ('55555555-5555-5555-5555-555555555555', 'Prestige Estates',        'prestige-estates',        'Bengaluru',   'Karnataka',   'verified', true),
  ('66666666-6666-6666-6666-666666666666', 'Brigade Group',           'brigade-group',           'Bengaluru',   'Karnataka',   'verified', true),
  ('77777777-7777-7777-7777-777777777777', 'Emaar India',             'emaar-india',             'Gurugram',    'Haryana',     'verified', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Helper: resolve posted_by from the first registered profile ──────────────
-- We wrap everything in a DO block so we can use a variable.
DO $$
DECLARE
  v_posted_by UUID;
  v_m1 UUID := gen_random_uuid();
  v_m2 UUID := gen_random_uuid();
  v_m3 UUID := gen_random_uuid();
  v_m4 UUID := gen_random_uuid();
  v_m5 UUID := gen_random_uuid();
  v_m6 UUID := gen_random_uuid();
  v_m7 UUID := gen_random_uuid();
  v_m8 UUID := gen_random_uuid();
BEGIN
  -- Pick the oldest registered profile as the demo poster
  SELECT id INTO v_posted_by FROM profiles ORDER BY created_at ASC LIMIT 1;

  IF v_posted_by IS NULL THEN
    RAISE NOTICE 'No profiles found — register at least one user first, then re-run this seed.';
    RETURN;
  END IF;

  -- ─── Mandates ────────────────────────────────────────────────────────────────
  INSERT INTO mandates (
    id, title, description, mandate_type, property_type,
    min_budget, max_budget, min_area, max_area, area_unit,
    city, state, locations, tags, status,
    views_count, intro_count,
    expires_at, posted_by, company_id
  ) VALUES

  -- 1. 3BHK / 4BHK — Bandra
  (v_m1,
   '3BHK / 4BHK in Bandra or Khar West',
   E'Looking for a premium 3BHK or 4BHK apartment in Bandra West or Khar West for a HNI client.\n\nKey requirements:\n- Minimum 1,800 sq.ft carpet area\n- High floor preferred (above 10th floor)\n- Sea view or garden view preferred\n- Parking: minimum 2 covered spots\n- Ready to move or within 6 months possession\n\nClient is pre-approved and ready to close within 30–45 days.',
   'buy', 'residential',
   20000000, 35000000, 1800, 3500, 'sqft',
   'Mumbai', 'Maharashtra',
   '["Bandra West","Khar West","Santacruz West"]',
   ARRAY['Premium','HNI Client','Ready to Move','Sea View'],
   'active', 420, 8,
   now() + interval '25 days',
   v_posted_by, '11111111-1111-1111-1111-111111111111'),

  -- 2. Luxury Penthouse — Worli
  (v_m2,
   'Luxury Penthouse in Worli Sea Face',
   E'Exclusive listing: a 4,500 sq.ft sky villa on the 42nd floor with unobstructed sea views.\n\nHighlights:\n- Private pool on terrace\n- 4 en-suite bedrooms + staff quarters\n- 4 reserved parking slots\n- White-glove concierge building\n- Ready possession',
   'sell', 'residential',
   250000000, 280000000, 4000, 5000, 'sqft',
   'Mumbai', 'Maharashtra',
   '["Worli Sea Face","Lower Parel"]',
   ARRAY['Penthouse','Sea View','Ultra Luxury','Ready Possession'],
   'active', 1240, 22,
   now() + interval '40 days',
   v_posted_by, '22222222-2222-2222-2222-222222222222'),

  -- 3. Grade A Office — BKC
  (v_m3,
   'Grade A Office Space in BKC',
   E'Seeking 20,000–30,000 sq.ft of contiguous Grade A office space in BKC or Lower Parel for a Fortune 500 occupier.\n\nRequirements:\n- LEED Gold or higher\n- 1:100 parking ratio\n- Floor plate 10,000+ sq.ft\n- 100% power backup\n- Fit-out cost contribution expected\n\nLease term: 5+5 years with escalation clause.',
   'lease', 'commercial',
   9500, 11000, 20000, 30000, 'sqft',
   'Mumbai', 'Maharashtra',
   '["BKC","Lower Parel","Worli"]',
   ARRAY['Grade A','LEED','Fortune 500','Long Lease'],
   'active', 680, 14,
   now() + interval '20 days',
   v_posted_by, '33333333-3333-3333-3333-333333333333'),

  -- 4. Warehouse — JNPT
  (v_m4,
   'Warehouse / Cold Storage near JNPT',
   E'Mandate to acquire 40,000–60,000 sq.ft warehouse or cold-storage facility within 20 km of JNPT port.\n\nRequirements:\n- Dock levellers and wide internal roads\n- Power: 500 kVA and above\n- Clear height 9m+\n- 3PL / logistics operator preferred\n- Freehold or long lease (30+ years)',
   'buy', 'industrial',
   180000000, 220000000, 40000, 60000, 'sqft',
   'Navi Mumbai', 'Maharashtra',
   '["JNPT","Dronagiri","Uran","Panvel"]',
   ARRAY['Warehouse','Cold Storage','Logistics','Freehold'],
   'active', 340, 6,
   now() + interval '30 days',
   v_posted_by, '44444444-4444-4444-4444-444444444444'),

  -- 5. Commercial Yield — Bengaluru
  (v_m5,
   'Commercial Yield Investment – 8% Guaranteed',
   E'Pre-leased commercial asset with 8% net yield and a blue-chip MNC tenant on a 9-year lock-in.\n\nDetails:\n- Tenant: Fortune 500 IT company\n- Lease start: Q3 2024\n- Escalation: 15% every 3 years\n- Strata titles available (1,000 sq.ft upwards)\n- Assured rental from day 1\n\nIdeal for HNI / family office portfolio.',
   'investment', 'commercial',
   50000000, 100000000, 1000, 5000, 'sqft',
   'Bengaluru', 'Karnataka',
   '["Whitefield","Sarjapur Road","Electronic City"]',
   ARRAY['Pre-leased','8% Yield','MNC Tenant','Strata'],
   'active', 890, 31,
   now() + interval '35 days',
   v_posted_by, '55555555-5555-5555-5555-555555555555'),

  -- 6. Land JV — Pune
  (v_m6,
   'Land Parcel for JV Development – Pune',
   E'8–12 acre land parcel on Pune–Mumbai Expressway for joint-venture residential development.\n\nOpportunity:\n- FSI 1.5 (with TDR potential 2.0)\n- NA + DP Road approval in place\n- Ideal for affordable + mid-segment housing\n- Revenue share or development rights structure\n\nLandowner open to experienced developers only.',
   'joint_venture', 'land',
   300000000, 500000000, 400000, 500000, 'sqft',
   'Pune', 'Maharashtra',
   '["Talegaon","Khed","Chakan"]',
   ARRAY['JV','8 Acres','NA Plot','Revenue Share'],
   'active', 215, 9,
   now() + interval '60 days',
   v_posted_by, '11111111-1111-1111-1111-111111111111'),

  -- 7. Affordable 2BHK — Pune
  (v_m7,
   '2BHK Apartments in Pune – Affordable Segment',
   E'Mandate to source 2BHK units in the ₹45L–₹75L range for a corporate bulk purchase.\n\nCriteria:\n- Ready possession or within 3 months\n- RERA registered\n- Near Hinjewadi or Wakad IT parks\n- Minimum 650 sq.ft carpet\n- OC received\n\nBuying 20–30 units in a single project.',
   'buy', 'residential',
   4500000, 7500000, 650, 900, 'sqft',
   'Pune', 'Maharashtra',
   '["Hinjewadi","Wakad","Baner","Balewadi"]',
   ARRAY['Bulk Buy','RERA','Affordable','IT Corridor'],
   'active', 510, 17,
   now() + interval '15 days',
   v_posted_by, '55555555-5555-5555-5555-555555555555'),

  -- 8. Retail Chain — Delhi NCR
  (v_m8,
   'Retail Showroom – Pan India Expansion',
   E'Leading fashion retail chain mandating 3,000–6,000 sq.ft ground-floor showroom space in Tier 1 and Tier 2 cities.\n\nBrief:\n- Ground floor with direct street frontage\n- Mall anchor / high street acceptable\n- 12-ft clear ceiling height\n- Cities: Delhi, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Kolkata\n- Lease preferred: 5 years with lock-in\n\nBroker co-broking commission: 1 month rent.',
   'lease', 'commercial',
   5000000, 12000000, 3000, 6000, 'sqft',
   'Delhi', 'Delhi',
   '["Connaught Place","Khan Market","Lajpat Nagar","Karol Bagh"]',
   ARRAY['Retail','Pan India','Fashion','High Street'],
   'active', 760, 19,
   now() + interval '45 days',
   v_posted_by, '33333333-3333-3333-3333-333333333333')

  ON CONFLICT (id) DO NOTHING;

  -- ─── Mandate images ───────────────────────────────────────────────────────────
  INSERT INTO mandate_images (mandate_id, url, is_primary, sort_order) VALUES
    -- Mandate 1 — Bandra 3BHK
    (v_m1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', true,  0),
    (v_m1, 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80', false, 1),
    (v_m1, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80', false, 2),
    -- Mandate 2 — Worli Penthouse
    (v_m2, 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80', true,  0),
    (v_m2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', false, 1),
    (v_m2, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', false, 2),
    -- Mandate 3 — BKC Office
    (v_m3, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80', true,  0),
    (v_m3, 'https://images.unsplash.com/photo-1497366811353-6870744d04b0?w=1200&q=80', false, 1),
    -- Mandate 4 — Warehouse
    (v_m4, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80', true,  0),
    (v_m4, 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80', false, 1),
    -- Mandate 5 — Bengaluru Investment
    (v_m5, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80', true,  0),
    (v_m5, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80', false, 1),
    -- Mandate 6 — Pune JV Land
    (v_m6, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', true,  0),
    (v_m6, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80', false, 1),
    -- Mandate 7 — Pune 2BHK
    (v_m7, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80', true,  0),
    (v_m7, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', false, 1),
    -- Mandate 8 — Retail
    (v_m8, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', true,  0),
    (v_m8, 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80', false, 1)
  ;

  RAISE NOTICE 'Demo mandates inserted successfully (posted_by = %)', v_posted_by;
END $$;
