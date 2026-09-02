ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'Argentina',
  ADD COLUMN IF NOT EXISTS street TEXT;

UPDATE users
SET location_visibility = 'none'
WHERE location_visibility = 'private';

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_location_visibility_check;

ALTER TABLE users
  ADD CONSTRAINT users_location_visibility_check
    CHECK (location_visibility IN ('none', 'country', 'city', 'neighborhood'));
