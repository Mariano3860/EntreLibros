CREATE TABLE book_corners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  area TEXT,
  location GEOGRAPHY(Point, 4326),
  image_url TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  recent_exchange_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX book_corners_location_idx ON book_corners USING GIST (location);
CREATE INDEX book_corners_approved_idx ON book_corners(approved);
