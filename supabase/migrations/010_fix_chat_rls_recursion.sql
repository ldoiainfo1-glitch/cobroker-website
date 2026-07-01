-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: Fix infinite RLS recursion on conversation_participants
--
-- The original policy queried conversation_participants to check if the user
-- is a participant — causing Postgres to recurse infinitely (error 42P17).
-- Replace with a simple user_id = auth.uid() check instead.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Participants can view conversation members" ON conversation_participants;

CREATE POLICY "Participants can view conversation members"
  ON conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());
