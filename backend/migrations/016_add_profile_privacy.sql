ALTER TABLE users
  ADD COLUMN IF NOT EXISTS alias TEXT,
  ADD COLUMN IF NOT EXISTS profile_description TEXT,
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS location_visibility TEXT NOT NULL DEFAULT 'city';

UPDATE users
SET alias = name
WHERE alias IS NULL;

ALTER TABLE users
  ALTER COLUMN alias SET DEFAULT '',
  ALTER COLUMN alias SET NOT NULL,
  ADD CONSTRAINT users_profile_visibility_check
    CHECK (profile_visibility IN ('public', 'private')),
  ADD CONSTRAINT users_location_visibility_check
    CHECK (location_visibility IN ('private', 'city', 'neighborhood'));

CREATE INDEX IF NOT EXISTS users_profile_visibility_idx
  ON users(profile_visibility);
