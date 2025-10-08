CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE community_corner_scope AS ENUM ('public', 'semiprivate');
CREATE TYPE community_corner_status AS ENUM ('active', 'paused');
CREATE TYPE community_corner_visibility AS ENUM ('exact', 'approximate');

CREATE TABLE community_corners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  barrio TEXT,
  city TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  status community_corner_status NOT NULL DEFAULT 'active',
  draft BOOLEAN NOT NULL DEFAULT false,
  location GEOGRAPHY(Point,4326) NOT NULL,
  themes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX community_corners_location_idx ON community_corners USING GIST (location);
CREATE INDEX community_corners_status_idx ON community_corners(status);
CREATE INDEX community_corners_draft_idx ON community_corners(draft);

CREATE TABLE community_corner_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corner_id UUID NOT NULL REFERENCES community_corners(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX community_corner_photos_corner_idx ON community_corner_photos(corner_id);
CREATE INDEX community_corner_photos_primary_idx ON community_corner_photos(corner_id, is_primary DESC, position ASC);

CREATE TABLE community_corner_metrics (
  corner_id UUID PRIMARY KEY REFERENCES community_corners(id) ON DELETE CASCADE,
  total_visits INTEGER NOT NULL DEFAULT 0,
  interactions_last_week INTEGER NOT NULL DEFAULT 0,
  active_listings INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
