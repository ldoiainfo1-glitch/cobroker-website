-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009: Chat realtime + missing RLS + get_or_create_direct_conversation
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable Supabase Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Allow participants to update their own last_read_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversation_participants'
      AND policyname = 'Participants can update own read status'
  ) THEN
    CREATE POLICY "Participants can update own read status"
      ON conversation_participants FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Add metadata column to messages for mandate cards etc.
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Extend the type check to include mandate_share
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check
  CHECK (type IN ('text', 'image', 'file', 'voice', 'mandate_share'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: get or create a direct conversation between two users
-- Runs as SECURITY DEFINER to bypass RLS (needs to insert on behalf of both)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Find existing direct conversation between auth.uid() and other_user_id
  SELECT cp1.conversation_id INTO conv_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2
    ON cp2.conversation_id = cp1.conversation_id
    AND cp2.user_id = other_user_id
  JOIN conversations c
    ON c.id = cp1.conversation_id
    AND c.type = 'direct'
  WHERE cp1.user_id = auth.uid()
  LIMIT 1;

  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  -- Create new direct conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', auth.uid())
  RETURNING id INTO conv_id;

  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (conv_id, auth.uid()),
    (conv_id, other_user_id);

  RETURN conv_id;
END;
$$;
