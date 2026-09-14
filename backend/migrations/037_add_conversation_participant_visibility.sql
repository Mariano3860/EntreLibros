ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS conversation_participants_visible_user_idx
  ON conversation_participants(user_id, conversation_id)
  WHERE hidden_at IS NULL;
