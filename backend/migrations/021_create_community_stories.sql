CREATE TABLE IF NOT EXISTS community_stories (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  image_url TEXT,
  book_listing_id BIGINT REFERENCES book_listings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(trim(body)) > 0 OR image_url IS NOT NULL OR book_listing_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS community_stories_feed_idx
  ON community_stories(created_at DESC, id DESC);
