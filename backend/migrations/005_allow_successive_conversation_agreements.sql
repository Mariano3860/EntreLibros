-- Closed agreements remain immutable history; only one live agreement may exist.
CREATE UNIQUE INDEX exchange_agreements_active_conversation_idx
    ON public.exchange_agreements (conversation_id)
    WHERE state IN ('proposed', 'partially_confirmed', 'confirmed');

ALTER TABLE public.exchange_agreements
    DROP CONSTRAINT exchange_agreements_conversation_id_key;
