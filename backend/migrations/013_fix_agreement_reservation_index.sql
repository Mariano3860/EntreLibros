DROP INDEX IF EXISTS book_listings_exchange_agreement_idx;

CREATE INDEX IF NOT EXISTS book_listings_exchange_agreement_idx
  ON book_listings(exchange_agreement_id)
  WHERE exchange_agreement_id IS NOT NULL;
