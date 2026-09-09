ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS last_delivered_sequence BIGINT NOT NULL DEFAULT 0;

UPDATE conversation_participants
SET last_delivered_sequence = last_read_sequence
WHERE last_delivered_sequence < last_read_sequence;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'conversation_participants_last_delivered_sequence_check'
  ) THEN
    ALTER TABLE conversation_participants
      ADD CONSTRAINT conversation_participants_last_delivered_sequence_check
      CHECK (last_delivered_sequence >= 0);
  END IF;
END $$;
