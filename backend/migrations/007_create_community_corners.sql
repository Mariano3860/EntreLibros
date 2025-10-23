CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE community_corner_scope AS ENUM ('public', 'semiprivate');
CREATE TYPE community_corner_visibility AS ENUM ('exact', 'approximate');
CREATE TYPE community_corner_status AS ENUM ('active', 'paused');

CREATE TABLE community_corners (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  scope community_corner_scope NOT NULL,
  host_alias TEXT NOT NULL,
  internal_contact TEXT NOT NULL,
  rules TEXT,
  schedule TEXT,
  visibility_preference community_corner_visibility NOT NULL,
  address_street TEXT NOT NULL,
  address_number TEXT NOT NULL,
  address_unit TEXT,
  address_postal_code TEXT,
  status community_corner_status NOT NULL DEFAULT 'active',
  draft BOOLEAN NOT NULL DEFAULT false,
  consent BOOLEAN NOT NULL DEFAULT false,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX community_corners_location_idx
  ON community_corners USING GIST (location);

CREATE TABLE community_corner_photos (
  id UUID PRIMARY KEY,
  corner_id UUID NOT NULL REFERENCES community_corners(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX community_corner_photos_primary_unique
  ON community_corner_photos(corner_id)
  WHERE is_primary = true;

CREATE TABLE community_corner_metrics (
  corner_id UUID PRIMARY KEY REFERENCES community_corners(id) ON DELETE CASCADE,
  total_exchanges INTEGER NOT NULL DEFAULT 0,
  weekly_exchanges INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
