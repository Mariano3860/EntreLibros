DO $$
DECLARE
  viewer_id INTEGER;
  counterpart_id INTEGER;
  conversation_id BIGINT;
  counterpart_email TEXT;
BEGIN
  SELECT id INTO viewer_id
  FROM users
  WHERE email = 'user2@entrelibros.com';

  IF viewer_id IS NULL THEN
    RETURN;
  END IF;

  FOREACH counterpart_email IN ARRAY ARRAY[
    'community.demo.clara@entrelibros.local',
    'community.demo.tomas@entrelibros.local',
    'community.demo.julieta@entrelibros.local',
    'community.demo.pablo@entrelibros.local'
  ] LOOP
    counterpart_id := NULL;
    conversation_id := NULL;

    SELECT u.id INTO counterpart_id
    FROM users u
    WHERE u.email = counterpart_email;

    IF counterpart_id IS NULL OR NOT EXISTS (
      SELECT 1
      FROM book_listings listing
      WHERE listing.user_id = counterpart_id
        AND listing.availability = 'public'
        AND listing.is_draft = false
        AND listing.status = 'available'
        AND (listing.expires_at IS NULL OR listing.expires_at > NOW())
    ) THEN
      CONTINUE;
    END IF;

    SELECT conversation.id INTO conversation_id
    FROM conversations conversation
    WHERE EXISTS (
      SELECT 1
      FROM conversation_participants participant
      WHERE participant.conversation_id = conversation.id
        AND participant.user_id = viewer_id
    )
      AND EXISTS (
        SELECT 1
        FROM conversation_participants participant
        WHERE participant.conversation_id = conversation.id
          AND participant.user_id = counterpart_id
      )
    GROUP BY conversation.id
    HAVING COUNT(*) = 2
    ORDER BY conversation.id
    LIMIT 1;

    IF conversation_id IS NULL THEN
      INSERT INTO conversations DEFAULT VALUES
      RETURNING id INTO conversation_id;

      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (conversation_id, viewer_id), (conversation_id, counterpart_id);
    END IF;
  END LOOP;
END $$;
