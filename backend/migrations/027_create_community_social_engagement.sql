CREATE TABLE IF NOT EXISTS community_listing_likes (
  listing_id INTEGER NOT NULL REFERENCES book_listings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_listing_likes_listing_idx
  ON community_listing_likes(listing_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_story_likes (
  story_id BIGINT NOT NULL REFERENCES community_stories(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (story_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_story_likes_story_idx
  ON community_story_likes(story_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES book_listings(id) ON DELETE CASCADE,
  story_id BIGINT REFERENCES community_stories(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    ((listing_id IS NOT NULL)::INTEGER + (story_id IS NOT NULL)::INTEGER) = 1
  ),
  CHECK (length(trim(body)) > 0 AND length(trim(body)) <= 1000)
);

CREATE INDEX IF NOT EXISTS community_comments_listing_feed_idx
  ON community_comments(listing_id, created_at ASC, id ASC)
  WHERE listing_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS community_comments_story_feed_idx
  ON community_comments(story_id, created_at ASC, id ASC)
  WHERE story_id IS NOT NULL;
