CREATE TABLE IF NOT EXISTS message_drafts (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  attachment_metadata JSONB,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_id, author_id),
  CHECK (revision > 0),
  CHECK (length(body) <= 4000),
  CHECK (length(trim(body)) > 0 OR attachment_metadata IS NOT NULL),
  CHECK (attachment_metadata IS NULL OR jsonb_typeof(attachment_metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS message_drafts_author_updated_idx
  ON message_drafts(author_id, updated_at DESC);
