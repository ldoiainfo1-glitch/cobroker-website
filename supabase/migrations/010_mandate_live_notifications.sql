-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: Mandate live notifications trigger
--
-- When a mandate's status changes to 'active':
--   1. Notify the mandate owner  → "Your mandate is now live!"
--   2. Notify all other active users → "New mandate: <title> in <city>"
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_mandate_live()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status transitions TO 'active'
  IF (TG_OP = 'INSERT' AND NEW.status = 'active')
     OR (TG_OP = 'UPDATE' AND OLD.status <> 'active' AND NEW.status = 'active')
  THEN

    -- 1. Notify the mandate owner
    INSERT INTO notifications (user_id, type, title, body, data, is_read)
    VALUES (
      NEW.posted_by,
      'new_mandate',
      'Your mandate is now live! 🎉',
      'Your mandate "' || NEW.title || '" in ' || NEW.city || ' is now visible to all verified brokers on Co-Brokings.',
      jsonb_build_object(
        'actionUrl', '/dashboard/mandates',
        'mandateId', NEW.id
      ),
      false
    );

    -- 2. Notify all OTHER active users (excluding the owner)
    INSERT INTO notifications (user_id, type, title, body, data, is_read)
    SELECT
      p.id,
      'new_mandate',
      'New mandate: ' || NEW.title,
      'A new ' || NEW.mandate_type || ' mandate in ' || NEW.city || ' has been posted. Check it out on the marketplace.',
      jsonb_build_object(
        'actionUrl', '/dashboard/marketplace',
        'mandateId', NEW.id
      ),
      false
    FROM profiles p
    WHERE p.id <> NEW.posted_by
      AND p.is_active = true;

  END IF;

  RETURN NEW;
END;
$$;

-- Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS on_mandate_live ON mandates;

CREATE TRIGGER on_mandate_live
  AFTER INSERT OR UPDATE OF status ON mandates
  FOR EACH ROW
  EXECUTE FUNCTION notify_mandate_live();
