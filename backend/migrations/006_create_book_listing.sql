CREATE TYPE publication_status AS ENUM ('draft', 'available', 'reserved', 'inactive');
CREATE TYPE publication_type AS ENUM ('offer', 'want');
CREATE TYPE publication_availability AS ENUM ('public', 'private');
CREATE TYPE publication_condition AS ENUM ('new', 'very_good', 'good', 'acceptable');
CREATE TYPE publication_shipping_payer AS ENUM ('owner', 'requester', 'split');

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS format TEXT;

CREATE TABLE book_listings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status publication_status NOT NULL DEFAULT 'available',
  type publication_type NOT NULL,
  description TEXT,
  condition publication_condition,
  sale BOOLEAN NOT NULL DEFAULT false,
  donation BOOLEAN NOT NULL DEFAULT false,
  trade BOOLEAN NOT NULL DEFAULT false,
  price_amount NUMERIC(10, 2),
  price_currency TEXT,
  trade_preferences TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  availability publication_availability NOT NULL DEFAULT 'public',
  delivery_near_book_corner BOOLEAN NOT NULL DEFAULT false,
  delivery_in_person BOOLEAN NOT NULL DEFAULT false,
  delivery_shipping BOOLEAN NOT NULL DEFAULT false,
  delivery_shipping_payer publication_shipping_payer,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  corner_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX publications_user_id_idx ON book_listings(user_id);
CREATE INDEX publications_status_idx ON book_listings(status);
CREATE INDEX publications_availability_idx ON book_listings(availability);

CREATE TABLE book_listing_images (
  id SERIAL PRIMARY KEY,
  book_listing_id INTEGER NOT NULL REFERENCES book_listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX publication_images_publication_id_idx ON book_listing_images(book_listing_id);
