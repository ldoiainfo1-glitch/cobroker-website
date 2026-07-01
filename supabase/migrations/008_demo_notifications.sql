-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: Demo notifications for test users
-- Reflects real activities completed: intro flow, KYC upload, mandates
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Notifications for Priya Sharma ────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
SELECT
  p.id,
  notif.type,
  notif.title,
  notif.body,
  notif.data::jsonb,
  notif.is_read,
  notif.created_at
FROM profiles p
CROSS JOIN (VALUES
  (
    'intro_accepted',
    'Welcome to COBROKINGS!',
    'You joined via introduction from Arjun Mehta. Complete your profile to unlock the full network.',
    '{"actionUrl":"/dashboard/profile"}',
    false,
    now() - interval '3 hours'
  ),
  (
    'verification_update',
    'KYC Document Submitted',
    'Your KYC document has been submitted and is under review. Verification usually takes 24–48 hours.',
    '{"actionUrl":"/dashboard/kyc"}',
    false,
    now() - interval '2 hours'
  ),
  (
    'new_mandate',
    'Mandate Posted Successfully',
    'Your mandate is now live on the COBROKINGS marketplace and visible to the broker network.',
    '{"actionUrl":"/dashboard/mandates"}',
    true,
    now() - interval '1 day'
  ),
  (
    'system',
    'Profile Completeness: 70%',
    'Great progress! Upload a profile photo and add your company details to reach 100%.',
    '{"actionUrl":"/dashboard/profile"}',
    true,
    now() - interval '2 days'
  )
) AS notif(type, title, body, data, is_read, created_at)
WHERE p.email = 'priya.sharma.demo@cobrokings.in';

-- ── Notifications for Arjun Mehta ─────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, body, data, is_read, created_at)
SELECT
  p.id,
  notif.type,
  notif.title,
  notif.body,
  notif.data::jsonb,
  notif.is_read,
  notif.created_at
FROM profiles p
CROSS JOIN (VALUES
  (
    'new_follower',
    'Priya Sharma Joined Your Network',
    'Priya Sharma registered using your referral link. Your network now has 1 member.',
    '{"actionUrl":"/dashboard/network"}',
    false,
    now() - interval '3 hours'
  ),
  (
    'new_mandate',
    'New Mandate Match in South Delhi',
    'A new residential buy mandate in South Delhi matches your activity area.',
    '{"actionUrl":"/dashboard/marketplace"}',
    false,
    now() - interval '5 hours'
  ),
  (
    'verification_update',
    'KYC Verified ✓',
    'Congratulations! Your KYC has been approved. Your profile now shows the Verified badge.',
    '{"actionUrl":"/dashboard/profile"}',
    true,
    now() - interval '1 day'
  ),
  (
    'system',
    'Welcome to COBROKINGS',
    'Your account is set up. Start by posting your first mandate or joining a co-broking circle.',
    '{"actionUrl":"/dashboard"}',
    true,
    now() - interval '3 days'
  )
) AS notif(type, title, body, data, is_read, created_at)
WHERE p.email = 'arjun.mehta.demo@cobrokings.in';
