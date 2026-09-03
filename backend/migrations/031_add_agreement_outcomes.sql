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
