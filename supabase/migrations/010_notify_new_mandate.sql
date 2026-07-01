-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: Notify all users when a mandate goes live
--
-- Fires on:
--   INSERT  with status = 'active'
--   UPDATE  where status changes to 'active' (e.g. draft → publish)
--
-- Creates a 'new_mandate' notification for every user EXCEPT the poster.
-- Runs as SECURITY DEFINER to bypass RLS on notifications INSERT.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_new_mandate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poster_name        TEXT;
  mandate_type_label TEXT;
BEGIN
  -- Only act when status becomes 'active'
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status = 'active') OR
    (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active')
  ) THEN
    RETURN NEW;
  END IF;

  -- Poster's display name
  SELECT full_name INTO poster_name
  FROM profiles WHERE id = NEW.posted_by;

  -- Human-readable mandate type (buy → Buy, joint_venture → Joint Venture)
  mandate_type_label := INITCAP(REPLACE(NEW.mandate_type, '_', ' '));

  -- Insert one notification per user (batch, excluding poster)
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT
    p.id,
    'new_mandate',
    mandate_type_label || ' mandate: ' || NEW.title,
    COALESCE(poster_name, 'A broker')
      || ' posted a new '
      || LOWER(mandate_type_label)
      || ' mandate in '
      || NEW.city
      || '. Check it out on the marketplace.',
    jsonb_build_object(
      'actionUrl',   '/dashboard/marketplace',
      'mandateId',   NEW.id,
      'city',        NEW.city,
      'mandateType', NEW.mandate_type
    )
  FROM profiles p
  WHERE p.id <> NEW.posted_by;

  RETURN NEW;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS on_mandate_active ON mandates;

CREATE TRIGGER on_mandate_active
  AFTER INSERT OR UPDATE OF status ON mandates
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_mandate();
