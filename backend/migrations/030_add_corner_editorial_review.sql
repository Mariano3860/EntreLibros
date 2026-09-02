ALTER TABLE community_corners
  ADD COLUMN IF NOT EXISTS editorial_status publication_editorial_status
    NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS editorial_reason TEXT;

CREATE INDEX IF NOT EXISTS community_corners_editorial_status_idx
  ON community_corners(editorial_status);
