ALTER TABLE community_corners
  ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS community_corners_owner_idx
  ON community_corners(owner_id);

-- NULL keeps old corners visible while avoiding an unsafe owner guess.
