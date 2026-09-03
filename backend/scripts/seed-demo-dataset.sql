-- Synthetic local dataset for the real-API walkthrough.
-- Run after `npm run migrate` against a non-production database:
--   psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
-- Both demo users use the password `Demo123!`.

BEGIN;

DO $$
DECLARE
  alma_id INTEGER;
  bruno_id INTEGER;
  alma_book_id INTEGER;
  bruno_book_id INTEGER;
  alma_listing_id INTEGER;
  bruno_listing_id INTEGER;
  v_conversation_id BIGINT;
  v_agreement_id BIGINT;
  message_sequence BIGINT;
BEGIN
  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'Alma Demo', 'Alma Demo', 'demo.alma@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user', 'es', 'Comparte narrativa y busca encuentros seguros.',
    'public', 'neighborhood', ARRAY['fiction', 'romance'], 'Argentina',
    'Buenos Aires', 'Palermo',
    ST_SetSRID(ST_MakePoint(-58.4116, -34.5884), 4326)::geography, 10
  )
  ON CONFLICT (email) DO UPDATE SET alias = EXCLUDED.alias
  RETURNING id INTO alma_id;

  IF alma_id IS NULL THEN
    SELECT id INTO alma_id FROM users WHERE email = 'demo.alma@entrelibros.local';
  END IF;

  INSERT INTO users (
    name, alias, email, password, role, language, profile_description,
    profile_visibility, location_visibility, interests, country, city,
    neighborhood, location, search_radius
  ) VALUES (
    'Bruno Demo', 'Bruno Demo', 'demo.bruno@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user', 'es', 'Busca fantasia y conversaciones sobre libros.',
    'public', 'city', ARRAY['fantasy', 'science-fiction'], 'Argentina',
    'Buenos Aires', 'Chacarita',
    ST_SetSRID(ST_MakePoint(-58.452, -34.584), 4326)::geography, 15
  )
  ON CONFLICT (email) DO UPDATE SET alias = EXCLUDED.alias
  RETURNING id INTO bruno_id;

  IF bruno_id IS NULL THEN
    SELECT id INTO bruno_id FROM users WHERE email = 'demo.bruno@entrelibros.local';
  END IF;

  SELECT id INTO alma_book_id FROM books
  WHERE title = 'Libro demo de Alma' AND author = 'Autoria sintetica';
  IF alma_book_id IS NULL THEN
    INSERT INTO books (title, author, language, format, cover_url)
    VALUES ('Libro demo de Alma', 'Autoria sintetica', 'es', 'paperback',
            'https://covers.openlibrary.org/b/id/demo-alma-M.jpg')
    RETURNING id INTO alma_book_id;
  END IF;

  SELECT id INTO bruno_book_id FROM books
  WHERE title = 'Libro demo de Bruno' AND author = 'Autoria sintetica';
  IF bruno_book_id IS NULL THEN
    INSERT INTO books (title, author, language, format, cover_url)
    VALUES ('Libro demo de Bruno', 'Autoria sintetica', 'es', 'paperback',
            'https://covers.openlibrary.org/b/id/demo-bruno-M.jpg')
    RETURNING id INTO bruno_book_id;
  END IF;

  SELECT id INTO alma_listing_id FROM book_listings
  WHERE user_id = alma_id AND book_id = alma_book_id AND is_draft = false;
  IF alma_listing_id IS NULL THEN
    INSERT INTO book_listings (
      user_id, book_id, status, type, description, condition, trade,
      availability, is_draft, content_consent, image_consent, rules_consent
    ) VALUES (
      alma_id, alma_book_id, 'available', 'offer',
      'Ejemplar sintetico disponible para intercambio.', 'very_good', true,
      'public', false, true, true, true
    )
    RETURNING id INTO alma_listing_id;
  END IF;

  SELECT id INTO bruno_listing_id FROM book_listings
  WHERE user_id = bruno_id AND book_id = bruno_book_id AND is_draft = false;
  IF bruno_listing_id IS NULL THEN
    INSERT INTO book_listings (
      user_id, book_id, status, type, description, condition, trade,
      availability, is_draft, content_consent, image_consent, rules_consent
    ) VALUES (
      bruno_id, bruno_book_id, 'available', 'offer',
      'Ejemplar sintetico disponible para intercambio.', 'good', true,
      'public', false, true, true, true
    )
    RETURNING id INTO bruno_listing_id;
  END IF;

  INSERT INTO community_corners (
    id, name, scope, host_alias, internal_contact, rules, schedule,
    visibility_preference, address_street, address_number, address_unit,
    address_postal_code, status, draft, consent, location, editorial_status
  ) VALUES (
    '00000000-0000-4000-8000-000000000001', 'Rincon Demo Centro', 'public',
    'Alma Demo', 'demo-internal-contact', 'Encuentros con aviso previo.',
    'Sabados 10:00-13:00', 'approximate', 'Calle Demo', '100', NULL, '1000',
    'active', false, true,
    ST_SetSRID(ST_MakePoint(-58.4105, -34.5975), 4326)::geography, 'approved'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'active', consent = true;

  SELECT c.id INTO v_conversation_id
  FROM conversations c
  JOIN conversation_participants p1 ON p1.conversation_id = c.id
  JOIN conversation_participants p2 ON p2.conversation_id = c.id
  WHERE p1.user_id = alma_id AND p2.user_id = bruno_id
  GROUP BY c.id;
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, alma_id), (v_conversation_id, bruno_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM messages m
    WHERE m.conversation_id = v_conversation_id
      AND m.sender_id = alma_id
      AND m.client_key = 'demo-first-contact'
  ) THEN
    UPDATE conversations c
    SET last_message_sequence = c.last_message_sequence + 1, updated_at = NOW()
    WHERE c.id = v_conversation_id
    RETURNING c.last_message_sequence INTO message_sequence;
    INSERT INTO messages (
      conversation_id, sender_id, sequence, client_key, body,
      attachment_metadata
    ) VALUES (
      v_conversation_id, alma_id, message_sequence, 'demo-first-contact',
      'Hola Bruno, te escribo por el intercambio del libro demo.',
      jsonb_build_object(
        'kind', 'book', 'bookId', bruno_listing_id::text,
        'title', 'Libro demo de Bruno', 'author', 'Autoria sintetica',
        'coverUrl', 'https://covers.openlibrary.org/b/id/demo-bruno-M.jpg'
      )
    );
  END IF;

  SELECT a.id INTO v_agreement_id FROM exchange_agreements a
  WHERE a.conversation_id = v_conversation_id;
  IF v_agreement_id IS NULL THEN
    INSERT INTO exchange_agreements (
      conversation_id, proposer_id, participant_id, state, current_version
    ) VALUES (v_conversation_id, alma_id, bruno_id, 'confirmed', 1)
    RETURNING id INTO v_agreement_id;
    INSERT INTO exchange_agreement_versions (
      agreement_id, version, actor_id, state, details
    ) VALUES (
      v_agreement_id, 1, alma_id, 'confirmed',
      jsonb_build_object(
        'meetingPoint', 'Rincon Demo Centro', 'area', 'Centro',
        'date', '2026-09-12', 'time', '11:00',
        'bookTitle', 'Libro demo de Bruno'
      )
    );
    INSERT INTO exchange_agreement_items (agreement_id, version, listing_id, owner_id)
    VALUES (v_agreement_id, 1, alma_listing_id, alma_id),
           (v_agreement_id, 1, bruno_listing_id, bruno_id);
    INSERT INTO exchange_agreement_acceptances (agreement_id, version, user_id)
    VALUES (v_agreement_id, 1, alma_id), (v_agreement_id, 1, bruno_id);
    INSERT INTO agreement_events (agreement_id, version, actor_id, event_type)
    VALUES (v_agreement_id, 1, alma_id, 'proposal'),
           (v_agreement_id, 1, bruno_id, 'confirm');
  END IF;

  INSERT INTO exchange_agreement_outcomes (agreement_id, user_id, outcome, reason)
  VALUES (v_agreement_id, alma_id, 'completed', 'Resultado sintetico de demostracion')
  ON CONFLICT (agreement_id, user_id) DO UPDATE
  SET outcome = EXCLUDED.outcome, reason = EXCLUDED.reason;

  INSERT INTO notifications (
    recipient_id, kind, entity_id, title_key, body_key, data, idempotency_key
  ) VALUES
    (alma_id, 'agreement', v_agreement_id::text, 'notifications.agreement.confirmed',
     'notifications.agreement.confirmedWith',
     jsonb_build_object('state', 'confirmed', 'participantName', 'Bruno Demo'),
     'demo-agreement-alma'),
    (bruno_id, 'message', v_conversation_id::text, 'notifications.message.new',
     'notifications.message.newFrom',
     jsonb_build_object('senderName', 'Alma Demo', 'conversationId', v_conversation_id),
     'demo-message-bruno')
  ON CONFLICT (idempotency_key) DO NOTHING;

  INSERT INTO analytics_events (
    event_type, actor_id, entity_type, entity_id, metadata, idempotency_key
  ) VALUES
    ('listing_published', alma_id, 'listing', alma_listing_id::text, '{}', 'demo-published-alma'),
    ('listing_published', bruno_id, 'listing', bruno_listing_id::text, '{}', 'demo-published-bruno'),
    ('contact_started', alma_id, 'listing', bruno_listing_id::text,
     jsonb_build_object('conversationId', v_conversation_id), 'demo-contact-bruno'),
    ('agreement_created', alma_id, 'agreement', v_agreement_id::text, '{}', 'demo-agreement-created'),
    ('agreement_confirmed', bruno_id, 'agreement', v_agreement_id::text, '{}', 'demo-agreement-confirmed')
  ON CONFLICT (idempotency_key) DO NOTHING;
END $$;

COMMIT;
