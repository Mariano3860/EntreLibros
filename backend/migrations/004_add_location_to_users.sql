CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE users
  ADD COLUMN location GEOGRAPHY(Point,4326),
  ADD COLUMN search_radius INTEGER;

CREATE INDEX users_location_idx ON users USING GIST (location);
