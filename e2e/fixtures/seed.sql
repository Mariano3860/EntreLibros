-- Deterministic E2E-only seed. It is applied after the existing migrations and
-- never changes a migration file or uses a real credential.
-- All E2E users use the password: Demo123!

DO $$
DECLARE
  user_a_id INTEGER;
  user_b_id INTEGER;
  outsider_id INTEGER;
  admin_id INTEGER;
  book_a_id INTEGER;
  book_b_id INTEGER;
  listing_a_id INTEGER;
  listing_b_id INTEGER;
  seed_conversation_id BIGINT;
  seed_agreement_id BIGINT;
BEGIN
  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'E2E User A', 'E2E User A', 'e2e.user.a@entrelibros.local',
    '$2b$10$YhaF/tEVbS.vLxZL0by4xuNvzWCas3OCxJaP/I3wCPSgmki4N5iby',
    'user', 'es', 'Usuario A del baseline E2E.', 'public', 'neighborhood',
    ARRAY['fiction', 'romance'], 'Argentina', 'Buenos Aires', 'Palermo',
    ST_SetSRID(ST_MakePoint(-58.4116, -34.5884), 4326)::geography, 10
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    language = EXCLUDED.language,
    profile_description = EXCLUDED.profile_description,
    profile_visibility = EXCLUDED.profile_visibility,
    location_visibility = EXCLUDED.location_visibility,
    interests = EXCLUDED.interests,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    neighborhood = EXCLUDED.neighborhood,
    location = EXCLUDED.location,
    search_radius = EXCLUDED.search_radius
  RETURNING id INTO user_a_id;

  SELECT id INTO user_a_id FROM users WHERE email = 'e2e.user.a@entrelibros.local';

  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'E2E User B', 'E2E User B', 'e2e.user.b@entrelibros.local',
    '$2b$10$YhaF/tEVbS.vLxZL0by4xuNvzWCas3OCxJaP/I3wCPSgmki4N5iby',
    'user', 'es', 'Usuario B del baseline E2E.', 'public', 'city',
    ARRAY['fantasy', 'science-fiction'], 'Argentina', 'Buenos Aires', 'Chacarita',
    ST_SetSRID(ST_MakePoint(-58.452, -34.584), 4326)::geography, 15
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    language = EXCLUDED.language,
    profile_description = EXCLUDED.profile_description,
    profile_visibility = EXCLUDED.profile_visibility,
    location_visibility = EXCLUDED.location_visibility,
    interests = EXCLUDED.interests,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    neighborhood = EXCLUDED.neighborhood,
    location = EXCLUDED.location,
    search_radius = EXCLUDED.search_radius
  RETURNING id INTO user_b_id;

  SELECT id INTO user_b_id FROM users WHERE email = 'e2e.user.b@entrelibros.local';

  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'E2E Outsider', 'E2E Outsider', 'e2e.outsider@entrelibros.local',
    '$2b$10$YhaF/tEVbS.vLxZL0by4xuNvzWCas3OCxJaP/I3wCPSgmki4N5iby',
    'user', 'es', 'Usuario ajeno a la conversación A/B.', 'public', 'city',
    ARRAY['history'], 'Argentina', 'Buenos Aires', 'Caballito',
    ST_SetSRID(ST_MakePoint(-58.437, -34.618), 4326)::geography, 20
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    language = EXCLUDED.language,
    profile_description = EXCLUDED.profile_description,
    profile_visibility = EXCLUDED.profile_visibility,
    location_visibility = EXCLUDED.location_visibility,
    interests = EXCLUDED.interests,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    neighborhood = EXCLUDED.neighborhood,
    location = EXCLUDED.location,
    search_radius = EXCLUDED.search_radius
  RETURNING id INTO outsider_id;

  SELECT id INTO outsider_id FROM users WHERE email = 'e2e.outsider@entrelibros.local';

  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'E2E Admin', 'E2E Admin', 'e2e.admin@entrelibros.local',
    '$2b$10$YhaF/tEVbS.vLxZL0by4xuNvzWCas3OCxJaP/I3wCPSgmki4N5iby',
    'admin', 'es', 'Administrador del baseline E2E.', 'public', 'city',
    ARRAY['fiction'], 'Argentina', 'Buenos Aires', 'Recoleta',
    ST_SetSRID(ST_MakePoint(-58.397, -34.588), 4326)::geography, 10
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    language = EXCLUDED.language,
    profile_description = EXCLUDED.profile_description,
    profile_visibility = EXCLUDED.profile_visibility,
    location_visibility = EXCLUDED.location_visibility,
    interests = EXCLUDED.interests,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    neighborhood = EXCLUDED.neighborhood,
    location = EXCLUDED.location,
    search_radius = EXCLUDED.search_radius
  RETURNING id INTO admin_id;

  SELECT id INTO admin_id FROM users WHERE email = 'e2e.admin@entrelibros.local';

  SELECT id INTO book_a_id FROM books WHERE title = 'E2E Book A' AND author = 'E2E Author A';

  IF book_a_id IS NULL THEN
    INSERT INTO books (
      title, author, publisher, published_year, verified, language, format, cover_url
    ) VALUES (
      'E2E Book A', 'E2E Author A', 'EntreLibros E2E', 2020, true, 'es',
      'paperback', 'https://example.invalid/e2e-book-a.jpg'
    ) RETURNING id INTO book_a_id;
  END IF;

  UPDATE books SET publisher = 'EntreLibros E2E', published_year = 2020,
    verified = true, language = 'es', format = 'paperback',
    cover_url = 'https://example.invalid/e2e-book-a.jpg'
  WHERE id = book_a_id;

  SELECT id INTO book_b_id FROM books WHERE title = 'E2E Book B' AND author = 'E2E Author B';

  IF book_b_id IS NULL THEN
    INSERT INTO books (
      title, author, publisher, published_year, verified, language, format, cover_url
    ) VALUES (
      'E2E Book B', 'E2E Author B', 'EntreLibros E2E', 2021, true, 'es',
      'paperback', 'https://example.invalid/e2e-book-b.jpg'
    ) RETURNING id INTO book_b_id;
  END IF;

  UPDATE books SET publisher = 'EntreLibros E2E', published_year = 2021,
    verified = true, language = 'es', format = 'paperback',
    cover_url = 'https://example.invalid/e2e-book-b.jpg'
  WHERE id = book_b_id;

  SELECT id INTO listing_a_id FROM book_listings
  WHERE user_id = user_a_id AND book_id = book_a_id;
  IF listing_a_id IS NULL THEN
    INSERT INTO book_listings (
      user_id, book_id, status, type, description, condition, trade,
      availability, is_draft, content_consent, image_consent, rules_consent,
      editorial_status
    ) VALUES (
      user_a_id, book_a_id, 'available', 'offer',
      'Publicación E2E de A.', 'very_good', true, 'public', false,
      true, true, true, 'approved'
    ) RETURNING id INTO listing_a_id;
  ELSE
    UPDATE book_listings SET status = 'available', type = 'offer',
      description = 'Publicación E2E de A.', condition = 'very_good',
      trade = true, availability = 'public', is_draft = false,
      content_consent = true, image_consent = true, rules_consent = true,
      editorial_status = 'approved'
    WHERE id = listing_a_id;
  END IF;

  SELECT id INTO listing_b_id FROM book_listings
  WHERE user_id = user_b_id AND book_id = book_b_id;
  IF listing_b_id IS NULL THEN
    INSERT INTO book_listings (
      user_id, book_id, status, type, description, condition, trade,
      availability, is_draft, content_consent, image_consent, rules_consent,
      editorial_status
    ) VALUES (
      user_b_id, book_b_id, 'available', 'offer',
      'Publicación E2E de B.', 'good', true, 'public', false,
      true, true, true, 'approved'
    ) RETURNING id INTO listing_b_id;
  ELSE
    UPDATE book_listings SET status = 'available', type = 'offer',
      description = 'Publicación E2E de B.', condition = 'good',
      trade = true, availability = 'public', is_draft = false,
      content_consent = true, image_consent = true, rules_consent = true,
      editorial_status = 'approved'
    WHERE id = listing_b_id;
  END IF;

  INSERT INTO user_follows (follower_id, followed_id)
  VALUES (user_a_id, user_b_id)
  ON CONFLICT DO NOTHING;

  SELECT conversation.id INTO seed_conversation_id
  FROM conversations conversation
  JOIN conversation_participants first_member
    ON first_member.conversation_id = conversation.id AND first_member.user_id = user_a_id
  JOIN conversation_participants second_member
    ON second_member.conversation_id = conversation.id AND second_member.user_id = user_b_id
  WHERE (SELECT COUNT(*) FROM conversation_participants member
         WHERE member.conversation_id = conversation.id) = 2
  ORDER BY conversation.id
  LIMIT 1;

  IF seed_conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO seed_conversation_id;
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (seed_conversation_id, user_a_id), (seed_conversation_id, user_b_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM messages
    WHERE messages.conversation_id = seed_conversation_id
      AND messages.client_key = 'e2e-seed-welcome'
  ) THEN
    INSERT INTO messages (
      conversation_id, sender_id, sequence, client_key, body
    ) VALUES (
      seed_conversation_id, user_a_id,
      (SELECT last_message_sequence + 1 FROM conversations WHERE id = seed_conversation_id),
      'e2e-seed-welcome', 'Mensaje inicial del seed E2E.'
    );
    UPDATE conversations
    SET last_message_sequence = last_message_sequence + 1,
        updated_at = NOW()
    WHERE id = seed_conversation_id;
  END IF;

  SELECT agreement.id INTO seed_agreement_id FROM exchange_agreements agreement
  WHERE agreement.conversation_id = seed_conversation_id;
  IF seed_agreement_id IS NULL THEN
    INSERT INTO exchange_agreements (
      conversation_id, proposer_id, participant_id, state, current_version
    ) VALUES (
      seed_conversation_id, user_a_id, user_b_id, 'proposed', 1
    ) RETURNING id INTO seed_agreement_id;

    INSERT INTO exchange_agreement_versions (
      agreement_id, version, actor_id, state, details
    ) VALUES (
      seed_agreement_id, 1, user_a_id, 'proposed',
      jsonb_build_object(
        'meetingPoint', 'Biblioteca E2E',
        'area', 'Palermo',
        'date', '2030-01-15',
        'time', '10:00',
        'bookTitle', 'E2E Book A'
      )
    );
    INSERT INTO exchange_agreement_items (
      agreement_id, version, listing_id, owner_id
    ) VALUES (seed_agreement_id, 1, listing_a_id, user_a_id);
  END IF;
END $$;
