ALTER TABLE book_listings
  ADD COLUMN IF NOT EXISTS exchange_agreement_id BIGINT
  REFERENCES exchange_agreements(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS book_listings_exchange_agreement_idx
  ON book_listings(exchange_agreement_id)
  WHERE exchange_agreement_id IS NOT NULL;
