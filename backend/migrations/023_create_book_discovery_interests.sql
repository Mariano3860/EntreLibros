CREATE TABLE IF NOT EXISTS user_book_listing_interests (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_listing_id INTEGER NOT NULL REFERENCES book_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, book_listing_id)
);

CREATE INDEX IF NOT EXISTS user_book_listing_interests_listing_idx
  ON user_book_listing_interests(book_listing_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS book_listings_active_want_user_book_idx
  ON book_listings(user_id, book_id)
  WHERE type = 'want' AND is_draft = false AND status = 'available';
