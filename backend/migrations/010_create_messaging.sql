CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_sequence BIGINT NOT NULL DEFAULT 0,
  CHECK (last_message_sequence >= 0)
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_sequence BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id),
  CHECK (last_read_sequence >= 0)
);

CREATE INDEX IF NOT EXISTS conversation_participants_user_idx
  ON conversation_participants(user_id, conversation_id);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  sequence BIGINT NOT NULL,
  client_key TEXT NOT NULL,
  body TEXT NOT NULL,
  attachment_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_id, sequence),
  UNIQUE (conversation_id, sender_id, client_key),
  CHECK (length(trim(body)) > 0 OR attachment_metadata IS NOT NULL),
  CHECK (attachment_metadata IS NULL OR jsonb_typeof(attachment_metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS messages_conversation_sequence_idx
  ON messages(conversation_id, sequence DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
