ALTER TABLE users
  ADD COLUMN IF NOT EXISTS interests TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT;

ALTER TABLE users
  ADD CONSTRAINT users_interests_not_null CHECK (interests IS NOT NULL),
  ADD CONSTRAINT users_interests_max_count CHECK (cardinality(interests) <= 8);
