-- Curated visual data for the local development database.
-- Run only after migrations, against a non-production database:
--   psql "$DATABASE_URL" -f backend/scripts/seed-realistic-local-dataset.sql
--
-- The script keeps identifiers, relationships, passwords and user-uploaded
-- content intact. It only normalizes known local/demo records and fills the
-- public image references used by the interface.

BEGIN;

SET LOCAL client_encoding = 'UTF8';

-- Replace placeholder bibliographic records with a coherent Spanish-language
-- catalogue. The cover IDs were checked against Open Library before loading.
WITH curated_books (
  id, title, author, isbn, publisher, published_year, cover_url
) AS (
  VALUES
    (1, 'Rayuela', 'Julio Cortázar', '9788437604794', 'Alfaguara', 1963,
     'https://covers.openlibrary.org/b/id/1047466-M.jpg'),
    (2, 'Cien años de soledad', 'Gabriel García Márquez', '9788437604947', 'Debolsillo', 1967,
     'https://covers.openlibrary.org/b/id/12627383-M.jpg'),
    (3, '1984', 'George Orwell', '9788499890944', 'Debolsillo', 1949,
     'https://covers.openlibrary.org/b/id/8495146-M.jpg'),
    (4, 'El principito', 'Antoine de Saint-Exupéry', '9788478887194', 'Salamandra', 1943,
     'https://covers.openlibrary.org/b/id/8668942-M.jpg'),
    (5, 'Orgullo y prejuicio', 'Jane Austen', '9788491050299', 'Austral', 1813,
     'https://covers.openlibrary.org/b/id/14348537-M.jpg'),
    (6, 'Crónica de una muerte anunciada', 'Gabriel García Márquez', '9788437604944', 'Debolsillo', 1981,
     'https://covers.openlibrary.org/b/id/8489859-M.jpg'),
    (7, 'El Aleph', 'Jorge Luis Borges', '9788420633111', 'Alianza Editorial', 1949,
     'https://covers.openlibrary.org/b/id/14408958-M.jpg'),
    (8, 'La sombra del viento', 'Carlos Ruiz Zafón', '9788408172179', 'Planeta', 2001,
     'https://covers.openlibrary.org/b/id/10107644-M.jpg'),
    (9, 'Los siete maridos de Evelyn Hugo', 'Taylor Jenkins Reid', '9788416517271', 'Umbriel', 2017,
     'https://covers.openlibrary.org/b/id/8354226-M.jpg'),
    (10, 'La casa de los espíritus', 'Isabel Allende', '9788497592208', 'Debolsillo', 1982,
     'https://covers.openlibrary.org/b/id/3205226-M.jpg'),
    (11, 'El nombre del viento', 'Patrick Rothfuss', '9788401337208', 'Plaza & Janés', 2008,
     'https://covers.openlibrary.org/b/id/11480483-M.jpg'),
    (12, 'Sapiens: de animales a dioses', 'Yuval Noah Harari', '9788499926223', 'Debate', 2011,
     'https://covers.openlibrary.org/b/id/8634250-M.jpg'),
    (13, 'Coraline', 'Neil Gaiman', '9788498382372', 'Salamandra', 2002,
     'https://covers.openlibrary.org/b/id/14171421-M.jpg'),
    (14, 'La mano izquierda de la oscuridad', 'Ursula K. Le Guin', '9788445000760', 'Minotauro', 1969,
     'https://covers.openlibrary.org/b/id/10618463-M.jpg'),
    (15, 'El problema de los tres cuerpos', 'Cixin Liu', '9788417347087', 'Nova', 2008,
     'https://covers.openlibrary.org/b/id/9157544-M.jpg'),
    (16, 'El amor en los tiempos del cólera', 'Gabriel García Márquez', '9788497592457', 'Debolsillo', 1985,
     'https://covers.openlibrary.org/b/id/10096404-M.jpg'),
    (17, 'Fahrenheit 451', 'Ray Bradbury', '9788497594257', 'Debolsillo', 1953,
     'https://covers.openlibrary.org/b/id/12993656-M.jpg'),
    (18, 'Persépolis', 'Marjane Satrapi', '9788497592444', 'Reservoir Books', 2000,
     'https://covers.openlibrary.org/b/id/12648921-M.jpg'),
    (19, 'El infinito en un junco', 'Irene Vallejo', '9788417860791', 'Siruela', 2019,
     'https://covers.openlibrary.org/b/id/9689877-M.jpg'),
    (20, 'Los detectives salvajes', 'Roberto Bolaño', '9788439722464', 'Anagrama', 1998,
     'https://covers.openlibrary.org/b/id/3706128-M.jpg'),
    (21, 'La carretera', 'Cormac McCarthy', '9788483468680', 'Debolsillo', 2006,
     'https://covers.openlibrary.org/b/id/198120-M.jpg'),
    (22, 'El dios de las pequeñas cosas', 'Arundhati Roy', '9788439722341', 'Anagrama', 1997,
     'https://covers.openlibrary.org/b/id/10513792-M.jpg'),
    (23, 'Piranesi', 'Susanna Clarke', '9788418015855', 'Editorial Alianza', 2020,
     'https://covers.openlibrary.org/b/id/10226290-M.jpg'),
    (24, 'La vegetariana', 'Han Kang', '9788497595728', 'Rata', 2007,
     'https://covers.openlibrary.org/b/id/7412625-M.jpg'),
    (25, 'El año del pensamiento mágico', 'Joan Didion', '9788439724703', 'Mondadori', 2005,
     'https://covers.openlibrary.org/b/id/13693-M.jpg'),
    (26, 'La biblioteca de la medianoche', 'Matt Haig', '9788413621658', 'AdN', 2020,
     'https://covers.openlibrary.org/b/id/10701377-M.jpg')
)
UPDATE books AS b
SET title = seed.title,
    author = seed.author,
    isbn = seed.isbn,
    publisher = seed.publisher,
    published_year = seed.published_year,
    cover_url = seed.cover_url,
    language = 'es',
    format = 'paperback',
    verified = true
FROM curated_books AS seed
WHERE b.id = seed.id;

-- Give local human profiles a recognizable visual identity. The existing
-- uploaded image for user 4 is intentionally preserved.
WITH curated_users (
  id, name, alias, profile_photo_url, profile_description,
  country, city, neighborhood, interests
) AS (
  VALUES
    (1, 'Lucía Benítez', 'lucia.benitez',
     'https://randomuser.me/api/portraits/women/44.jpg',
     'Lectora curiosa. Siempre tiene una recomendación para compartir.',
     'Argentina', 'Buenos Aires', 'Almagro', ARRAY['fiction', 'romance', 'classics']),
    (2, 'Martín Quiroga', 'martin.quiroga',
     'https://randomuser.me/api/portraits/men/32.jpg',
     'Busca ciencia ficción, ensayo y buenas conversaciones sobre libros.',
     'Argentina', 'Buenos Aires', 'Villa Urquiza', ARRAY['science-fiction', 'history', 'philosophy']),
    (3, 'Mariano', 'Mariano',
     'https://randomuser.me/api/portraits/women/68.jpg',
     'Lector y anfitrión de encuentros alrededor de los libros.',
     'Argentina', 'Buenos Aires', 'Parque Patricios', ARRAY['fiction', 'classics']),
    (7, 'Sofía Ledesma', 'sofia.ledesma',
     'https://randomuser.me/api/portraits/women/65.jpg',
     'Disfruta las novelas contemporáneas y los intercambios tranquilos.',
     'Argentina', 'Buenos Aires', 'Belgrano', ARRAY['fiction', 'romance', 'contemporary']),
    (8, 'Clara Benítez', 'clara.benitez',
     'https://randomuser.me/api/portraits/women/12.jpg',
     'Organiza lecturas compartidas y cuida una pequeña biblioteca de barrio.',
     'Argentina', 'Buenos Aires', 'Palermo', ARRAY['fiction', 'classics', 'poetry']),
    (9, 'Tomás Ferreyra', 'tomas.ferreyra',
     'https://randomuser.me/api/portraits/men/75.jpg',
     'Fan de la fantasía y la ciencia ficción; intercambia libros en persona.',
     'Argentina', 'Buenos Aires', 'Chacarita', ARRAY['fantasy', 'science-fiction', 'adventure']),
    (10, 'Julieta Ríos', 'julieta.rios',
     'https://randomuser.me/api/portraits/women/31.jpg',
     'Lee narrativa histórica y recomienda títulos para largas tardes.',
     'Argentina', 'Buenos Aires', 'Caballito', ARRAY['history', 'fiction', 'classics']),
    (11, 'Pablo Acosta', 'pablo.acosta',
     'https://randomuser.me/api/portraits/men/41.jpg',
     'Colecciona novelas breves y disfruta descubrir autores nuevos.',
     'Argentina', 'Buenos Aires', 'Villa Crespo', ARRAY['fiction', 'literary-fiction', 'comedy'])
)
UPDATE users AS u
SET name = seed.name,
    alias = seed.alias,
    profile_photo_url = seed.profile_photo_url,
    profile_description = seed.profile_description,
    country = seed.country,
    city = seed.city,
    neighborhood = seed.neighborhood,
    interests = seed.interests,
    profile_visibility = 'public',
    location_visibility = 'neighborhood'
FROM curated_users AS seed
WHERE u.id = seed.id
  AND u.role = 'user';

-- Make existing corners look like plausible neighborhood exchange points while
-- keeping their identifiers and approximate map positions.
WITH curated_corners (
  id, name, host_alias, rules, schedule, address_street,
  address_number, address_postal_code, owner_id
) AS (
  VALUES
    ('7a089a74-4dfc-4531-a04c-883d3cd2233a'::uuid,
     'Rincón de Lectura Chacarita', 'Tomás Ferreyra',
     'Intercambios coordinados con respeto y aviso previo.',
     'Sábados de 10:00 a 13:00', 'Jorge Newbery', '1700', '1426', 9),
    ('a7f5ab1c-6bea-4987-8229-168eb6205045'::uuid,
     'Biblioteca de Barrio Palermo', 'Clara Benítez',
     'Dejá un libro en buen estado y llevate otro que te acompañe.',
     'Miércoles de 17:00 a 20:00', 'Güemes', '3300', '1425', 8),
    ('dab30731-9cfb-493f-b76c-0c1a52a0267e'::uuid,
     'Café de los Libros Villa Crespo', 'Julieta Ríos',
     'Punto de encuentro vecinal. Confirmá la visita antes de acercarte.',
     'Viernes de 16:00 a 19:00', 'Loyola', '500', '1414', 10),
    ('22ea13e8-b6e2-4f11-98a4-1aa6aa6c46a2'::uuid,
     'Mesa Literaria Parque Patricios', 'Mariano',
     'Mesa abierta para compartir lecturas y coordinar intercambios.',
     'Domingos de 11:00 a 14:00', 'Av. Caseros', '3200', '1263', 4)
)
UPDATE community_corners AS c
SET name = seed.name,
    host_alias = seed.host_alias,
    rules = seed.rules,
    schedule = seed.schedule,
    address_street = seed.address_street,
    address_number = seed.address_number,
    address_postal_code = seed.address_postal_code,
    owner_id = seed.owner_id,
    scope = 'public',
    visibility_preference = 'approximate',
    status = 'active',
    draft = false,
    consent = true,
    editorial_status = 'approved',
    updated_at = NOW()
FROM curated_corners AS seed
WHERE c.id = seed.id;

-- Every non-draft listing receives the same real cover as its book record.
-- Existing rows are updated and missing primary rows are added without dupes.
UPDATE book_listing_images AS image
SET url = book.cover_url,
    is_primary = true,
    source = 'open-library',
    metadata = jsonb_build_object(
      'provider', 'open-library',
      'bookId', listing.book_id,
      'isbn', book.isbn
    )
FROM book_listings AS listing
JOIN books AS book ON book.id = listing.book_id
WHERE image.book_listing_id = listing.id
  AND listing.is_draft = false
  AND book.cover_url IS NOT NULL;

INSERT INTO book_listing_images (
  book_listing_id, url, is_primary, source, metadata
)
SELECT listing.id,
       book.cover_url,
       true,
       'open-library',
       jsonb_build_object(
         'provider', 'open-library',
         'bookId', listing.book_id,
         'isbn', book.isbn
       )
FROM book_listings AS listing
JOIN books AS book ON book.id = listing.book_id
WHERE listing.is_draft = false
  AND book.cover_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM book_listing_images AS existing
    WHERE existing.book_listing_id = listing.id
      AND existing.is_primary = true
  );

-- Replace embedded placeholder photos in the four existing corners with stable
-- public JPEGs. If a local database does not yet have one, create the primary
-- row idempotently.
WITH corner_photos (corner_id, url) AS (
  VALUES
    ('7a089a74-4dfc-4531-a04c-883d3cd2233a'::uuid,
     'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85'),
    ('a7f5ab1c-6bea-4987-8229-168eb6205045'::uuid,
     'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85'),
    ('dab30731-9cfb-493f-b76c-0c1a52a0267e'::uuid,
     'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85'),
    ('22ea13e8-b6e2-4f11-98a4-1aa6aa6c46a2'::uuid,
     'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=85')
)
UPDATE community_corner_photos AS photo
SET url = seed.url,
    is_primary = true
FROM corner_photos AS seed
WHERE photo.corner_id = seed.corner_id
  AND photo.is_primary = true;

WITH corner_photos (corner_id, url) AS (
  VALUES
    ('7a089a74-4dfc-4531-a04c-883d3cd2233a'::uuid,
     'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85'),
    ('a7f5ab1c-6bea-4987-8229-168eb6205045'::uuid,
     'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85'),
    ('dab30731-9cfb-493f-b76c-0c1a52a0267e'::uuid,
     'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85'),
    ('22ea13e8-b6e2-4f11-98a4-1aa6aa6c46a2'::uuid,
     'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=85')
)
INSERT INTO community_corner_photos (id, corner_id, external_id, url, is_primary)
SELECT gen_random_uuid(), seed.corner_id, 'realistic-local-primary', seed.url, true
FROM corner_photos AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM community_corner_photos AS existing
  WHERE existing.corner_id = seed.corner_id
    AND existing.is_primary = true
);

COMMIT;
