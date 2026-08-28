CREATE TABLE IF NOT EXISTS exchange_agreements (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  proposer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  state TEXT NOT NULL DEFAULT 'proposed',
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (proposer_id <> participant_id),
  CHECK (state IN ('proposed', 'partially_confirmed', 'confirmed', 'cancelled', 'rejected', 'completed')),
  CHECK (current_version > 0)
);

CREATE INDEX IF NOT EXISTS exchange_agreements_participants_idx
  ON exchange_agreements(proposer_id, participant_id);

CREATE TABLE IF NOT EXISTS exchange_agreement_versions (
  agreement_id BIGINT NOT NULL REFERENCES exchange_agreements(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  state TEXT NOT NULL DEFAULT 'proposed',
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (agreement_id, version),
  CHECK (version > 0),
  CHECK (state IN ('proposed', 'partially_confirmed', 'confirmed', 'cancelled', 'rejected', 'completed')),
  CHECK (jsonb_typeof(details) = 'object')
);

CREATE TABLE IF NOT EXISTS exchange_agreement_items (
  agreement_id BIGINT NOT NULL,
  version INTEGER NOT NULL,
  listing_id INTEGER NOT NULL REFERENCES book_listings(id) ON DELETE RESTRICT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  PRIMARY KEY (agreement_id, version, listing_id),
  FOREIGN KEY (agreement_id, version)
    REFERENCES exchange_agreement_versions(agreement_id, version) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS exchange_agreement_items_listing_idx
  ON exchange_agreement_items(listing_id);

CREATE TABLE IF NOT EXISTS exchange_agreement_acceptances (
  agreement_id BIGINT NOT NULL,
  version INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (agreement_id, version, user_id),
  FOREIGN KEY (agreement_id, version)
    REFERENCES exchange_agreement_versions(agreement_id, version) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agreement_events (
  id BIGSERIAL PRIMARY KEY,
  agreement_id BIGINT NOT NULL REFERENCES exchange_agreements(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(trim(event_type)) > 0)
);

CREATE INDEX IF NOT EXISTS agreement_events_agreement_idx
  ON agreement_events(agreement_id, created_at, id);
