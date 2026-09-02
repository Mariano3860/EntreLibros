DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'publication_editorial_status'
  ) THEN
    CREATE TYPE publication_editorial_status AS ENUM (
      'pending',
      'needs_correction',
      'approved',
      'rejected'
    );
  END IF;
END
$$;

ALTER TABLE book_listings
  ADD COLUMN IF NOT EXISTS editorial_status publication_editorial_status
    NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS editorial_reason TEXT;

CREATE INDEX IF NOT EXISTS book_listings_editorial_status_idx
  ON book_listings(editorial_status);
