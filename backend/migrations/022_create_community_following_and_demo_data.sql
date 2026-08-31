CREATE TABLE IF NOT EXISTS user_follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS user_follows_followed_idx
  ON user_follows(followed_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx
  ON user_follows(follower_id, created_at DESC);

DO $$
DECLARE
  clara_id INTEGER;
  tomas_id INTEGER;
  julieta_id INTEGER;
  pablo_id INTEGER;
  clara_book_id INTEGER;
  tomas_book_id INTEGER;
  julieta_book_id INTEGER;
  pablo_book_id INTEGER;
  clara_listing_id INTEGER;
  tomas_listing_id INTEGER;
  julieta_listing_id INTEGER;
  pablo_listing_id INTEGER;
BEGIN
  INSERT INTO users (
    name,
    alias,
    email,
    password,
    role,
    language,
    profile_description,
    profile_visibility,
    location_visibility,
    interests,
    city,
    neighborhood,
    location,
    search_radius
  ) VALUES (
    'Clara Ficción',
    'Clara Ficción',
    'community.demo.clara@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user',
    'es',
    'Leo ficción, romance y poesía. Siempre tengo una recomendación a mano.',
    'public',
    'neighborhood',
    ARRAY['fiction', 'romance', 'poetry'],
    'Buenos Aires',
    'Palermo',
    ST_SetSRID(ST_MakePoint(-58.4116, -34.5884), 4326)::geography,
    10
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO clara_id;

  IF clara_id IS NULL THEN
    SELECT id INTO clara_id
    FROM users
    WHERE email = 'community.demo.clara@entrelibros.local';
  END IF;

  INSERT INTO users (
    name,
    alias,
    email,
    password,
    role,
    language,
    profile_description,
    profile_visibility,
    location_visibility,
    interests,
    city,
    neighborhood,
    location,
    search_radius
  ) VALUES (
    'Tomás Fantasía',
    'Tomás Fantasía',
    'community.demo.tomas@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user',
    'es',
    'Busco mundos fantásticos y ciencia ficción para compartir.',
    'public',
    'city',
    ARRAY['fantasy', 'science-fiction', 'fiction'],
    'Buenos Aires',
    'Chacarita',
    ST_SetSRID(ST_MakePoint(-58.452, -34.584), 4326)::geography,
    15
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO tomas_id;

  IF tomas_id IS NULL THEN
    SELECT id INTO tomas_id
    FROM users
    WHERE email = 'community.demo.tomas@entrelibros.local';
  END IF;

  INSERT INTO users (
    name,
    alias,
    email,
    password,
    role,
    language,
    profile_description,
    profile_visibility,
    location_visibility,
    interests,
    city,
    neighborhood,
    location,
    search_radius
  ) VALUES (
    'Julieta Historia',
    'Julieta Historia',
    'community.demo.julieta@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user',
    'es',
    'Me interesan la historia, el ensayo y las conversaciones largas.',
    'public',
    'neighborhood',
    ARRAY['history', 'essay', 'fiction'],
    'Buenos Aires',
    'Caballito',
    ST_SetSRID(ST_MakePoint(-58.437, -34.618), 4326)::geography,
    20
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO julieta_id;

  IF julieta_id IS NULL THEN
    SELECT id INTO julieta_id
    FROM users
    WHERE email = 'community.demo.julieta@entrelibros.local';
  END IF;

  INSERT INTO users (
    name,
    alias,
    email,
    password,
    role,
    language,
    profile_description,
    profile_visibility,
    location_visibility,
    interests,
    city,
    neighborhood,
    location,
    search_radius
  ) VALUES (
    'Pablo Imaginario',
    'Pablo Imaginario',
    'community.demo.pablo@entrelibros.local',
    '$2b$10$mdxDuOLw.eFNlz/N13qrYOzolNUKHWvOdUM7Yc1Dyqd09JTNj8DJC',
    'user',
    'es',
    'Comparto lecturas para chicos y grandes con mucha imaginación.',
    'public',
    'city',
    ARRAY['children', 'fantasy'],
    'Buenos Aires',
    'Villa Crespo',
    ST_SetSRID(ST_MakePoint(-58.443, -34.599), 4326)::geography,
    15
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO pablo_id;

  IF pablo_id IS NULL THEN
    SELECT id INTO pablo_id
    FROM users
    WHERE email = 'community.demo.pablo@entrelibros.local';
  END IF;

  INSERT INTO books (title, author, publisher, published_year, verified, language, format, cover_url)
  VALUES (
    'La casa de los espíritus',
    'Isabel Allende',
    'Debolsillo',
    1982,
    true,
    'es',
    'paperback',
    'https://covers.openlibrary.org/b/isbn/9788497592208-M.jpg'
  )
  RETURNING id INTO clara_book_id;

  INSERT INTO books (title, author, publisher, published_year, verified, language, format, cover_url)
  VALUES (
    'El nombre del viento',
    'Patrick Rothfuss',
    'Plaza & Janés',
    2007,
    true,
    'es',
    'paperback',
    'https://covers.openlibrary.org/b/isbn/9788401337208-M.jpg'
  )
  RETURNING id INTO tomas_book_id;

  INSERT INTO books (title, author, publisher, published_year, verified, language, format, cover_url)
  VALUES (
    'Sapiens',
    'Yuval Noah Harari',
    'Debate',
    2014,
    true,
    'es',
    'paperback',
    'https://covers.openlibrary.org/b/isbn/9788499926223-M.jpg'
  )
  RETURNING id INTO julieta_book_id;

  INSERT INTO books (title, author, publisher, published_year, verified, language, format, cover_url)
  VALUES (
    'Coraline',
    'Neil Gaiman',
    'Salamandra',
    2003,
    true,
    'es',
    'paperback',
    'https://covers.openlibrary.org/b/isbn/9788498382372-M.jpg'
  )
  RETURNING id INTO pablo_book_id;

  INSERT INTO book_listings (
    user_id,
    book_id,
    status,
    type,
    description,
    condition,
    trade,
    availability,
    is_draft
  ) VALUES (
    clara_id,
    clara_book_id,
    'available',
    'offer',
    'Ejemplar cuidado, ideal para una nueva lectora.',
    'very_good',
    true,
    'public',
    false
  )
  RETURNING id INTO clara_listing_id;

  INSERT INTO book_listings (
    user_id,
    book_id,
    status,
    type,
    description,
    condition,
    trade,
    availability,
    is_draft
  ) VALUES (
    tomas_id,
    tomas_book_id,
    'available',
    'offer',
    'Una puerta de entrada a la fantasía épica.',
    'good',
    true,
    'public',
    false
  )
  RETURNING id INTO tomas_listing_id;

  INSERT INTO book_listings (
    user_id,
    book_id,
    status,
    type,
    description,
    condition,
    trade,
    availability,
    is_draft
  ) VALUES (
    julieta_id,
    julieta_book_id,
    'available',
    'offer',
    'Edición para leer y conversar en el barrio.',
    'very_good',
    true,
    'public',
    false
  )
  RETURNING id INTO julieta_listing_id;

  INSERT INTO book_listings (
    user_id,
    book_id,
    status,
    type,
    description,
    condition,
    trade,
    availability,
    is_draft
  ) VALUES (
    pablo_id,
    pablo_book_id,
    'available',
    'offer',
    'Libro breve y misterioso para compartir en familia.',
    'good',
    true,
    'public',
    false
  )
  RETURNING id INTO pablo_listing_id;

  INSERT INTO community_stories (user_id, body, book_listing_id)
  VALUES
    (clara_id, 'Terminé una novela que me dejó pensando en la familia y la memoria.', clara_listing_id),
    (tomas_id, '¿Qué mundo fantástico volverían a visitar? Yo sigo pensando en Temerant.', tomas_listing_id),
    (julieta_id, 'Una lectura para mirar la historia con otros ojos y abrir una buena charla.', julieta_listing_id),
    (pablo_id, 'Coraline sigue siendo una gran puerta de entrada a la lectura compartida.', pablo_listing_id);
END $$;
