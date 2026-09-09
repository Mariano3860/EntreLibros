-- Remove only the namespace created by seed-local-dataset.sql.
-- Shared bibliographic books are deliberately retained when they have no
-- reliable provenance marker; deleting a user's book would be unsafe.
BEGIN;

CREATE TEMP TABLE seed_user_ids (id INTEGER PRIMARY KEY) ON COMMIT DROP;
INSERT INTO seed_user_ids (id)
SELECT id FROM users WHERE email LIKE 'seed.%@entrelibros.local';

CREATE TEMP TABLE seed_conversation_ids (id BIGINT PRIMARY KEY) ON COMMIT DROP;
INSERT INTO seed_conversation_ids (id)
SELECT participant.conversation_id
FROM conversation_participants participant
GROUP BY participant.conversation_id
HAVING BOOL_AND(participant.user_id IN (SELECT id FROM seed_user_ids));

CREATE TEMP TABLE seed_agreement_ids (id BIGINT PRIMARY KEY) ON COMMIT DROP;
INSERT INTO seed_agreement_ids (id)
SELECT agreement.id
FROM exchange_agreements agreement
WHERE agreement.conversation_id IN (SELECT id FROM seed_conversation_ids)
  AND agreement.proposer_id IN (SELECT id FROM seed_user_ids)
  AND agreement.participant_id IN (SELECT id FROM seed_user_ids);

DELETE FROM analytics_events
WHERE idempotency_key LIKE 'seed-analytics-%'
   OR actor_id IN (SELECT id FROM seed_user_ids);

DELETE FROM notifications
WHERE idempotency_key LIKE 'seed-agreement-%'
   OR recipient_id IN (SELECT id FROM seed_user_ids);

DELETE FROM exchange_agreements
WHERE id IN (SELECT id FROM seed_agreement_ids);

DELETE FROM conversations
WHERE id IN (SELECT id FROM seed_conversation_ids);

DELETE FROM book_listings
WHERE user_id IN (SELECT id FROM seed_user_ids);

DELETE FROM community_corners
WHERE id IN (
  '4a089a74-4dfc-4531-a04c-883d3cd2233a',
  '5a089a74-4dfc-4531-a04c-883d3cd2233a',
  '6a089a74-4dfc-4531-a04c-883d3cd2233a',
  '7a089a74-4dfc-4531-a04c-883d3cd2233a',
  '8a089a74-4dfc-4531-a04c-883d3cd2233a',
  '9a089a74-4dfc-4531-a04c-883d3cd2233a',
  'aa089a74-4dfc-4531-a04c-883d3cd2233a',
  'ba089a74-4dfc-4531-a04c-883d3cd2233a'
);

DELETE FROM users WHERE id IN (SELECT id FROM seed_user_ids);

COMMIT;
