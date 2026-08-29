ALTER TABLE book_listings
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE book_listings
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 days');

UPDATE book_listings
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS book_listings_expiry_idx
  ON book_listings(status, availability, expires_at);
