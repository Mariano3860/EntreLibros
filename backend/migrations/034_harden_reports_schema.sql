CREATE TABLE IF NOT EXISTS exchange_agreement_outcomes (
  agreement_id BIGINT NOT NULL REFERENCES exchange_agreements(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'not_completed')),
  reason TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (agreement_id, user_id)
);

CREATE INDEX IF NOT EXISTS exchange_agreement_outcomes_agreement_idx
  ON exchange_agreement_outcomes(agreement_id, recorded_at);

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS category TEXT;

UPDATE reports
SET category = CASE target_type
  WHEN 'conduct' THEN 'conduct'
  WHEN 'corner_missing' THEN 'missing'
  ELSE 'content'
END
WHERE category IS NULL;

ALTER TABLE reports
  ALTER COLUMN category SET DEFAULT 'content',
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN channel SET DEFAULT 'support';

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'listing_published',
    'contact_started',
    'agreement_created',
    'agreement_confirmed',
    'agreement_reminder',
    'outcome_recorded'
  )),
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS analytics_events_type_time_idx
  ON analytics_events(event_type, occurred_at DESC);
