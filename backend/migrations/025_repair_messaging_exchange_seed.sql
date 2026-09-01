DO $$
BEGIN
  -- Keep the oldest empty conversation for each seeded pair. A repeated
  -- execution of migration 024 can only produce empty demo conversations;
  -- never remove a conversation that already contains user data.
  WITH seeded_conversations AS (
    SELECT conversation.id,
           counterpart.id AS counterpart_id,
           MIN(conversation.id) OVER (
             PARTITION BY counterpart.id
           ) AS canonical_id
    FROM conversations conversation
    JOIN conversation_participants viewer_member
      ON viewer_member.conversation_id = conversation.id
    JOIN users viewer ON viewer.id = viewer_member.user_id
    JOIN conversation_participants counterpart_member
      ON counterpart_member.conversation_id = conversation.id
    JOIN users counterpart ON counterpart.id = counterpart_member.user_id
    WHERE viewer.email = 'user2@entrelibros.com'
      AND counterpart.email = ANY (ARRAY[
        'community.demo.clara@entrelibros.local',
        'community.demo.tomas@entrelibros.local',
        'community.demo.julieta@entrelibros.local',
        'community.demo.pablo@entrelibros.local'
      ])
      AND (
        SELECT COUNT(*)
        FROM conversation_participants member
        WHERE member.conversation_id = conversation.id
      ) = 2
  ),
  empty_duplicates AS (
    SELECT seeded.id
    FROM seeded_conversations seeded
    WHERE seeded.id <> seeded.canonical_id
      AND NOT EXISTS (
        SELECT 1
        FROM messages
        WHERE messages.conversation_id = seeded.id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM exchange_agreements agreement
        WHERE agreement.conversation_id = seeded.id
      )
  )
  DELETE FROM conversations conversation
  USING empty_duplicates duplicate
  WHERE conversation.id = duplicate.id;
END $$;
