-- Curated local dataset for the real API walkthrough.
-- The Node wrapper checks the database name before executing this file.
-- It is intentionally not a migration and must never run in production.

BEGIN;
SET LOCAL client_encoding = 'UTF8';

CREATE TEMP TABLE seed_users (
  email TEXT PRIMARY KEY,
  id INTEGER NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_books (
  isbn TEXT PRIMARY KEY,
  id INTEGER NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_corners (
  key TEXT PRIMARY KEY,
  id UUID NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_listings (
  key TEXT PRIMARY KEY,
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_conversations (
  key TEXT PRIMARY KEY,
  id BIGINT NOT NULL,
  user_a INTEGER NOT NULL,
  user_b INTEGER NOT NULL
) ON COMMIT DROP;

DO $seed_users$
DECLARE
  item JSONB;
  user_id INTEGER;
BEGIN
  FOR item IN
    SELECT jsonb_array_elements($users$
      [
        {"email":"seed.lucia@entrelibros.local","name":"Lucía Benítez","alias":"lucia.benitez","city":"Buenos Aires","neighborhood":"Almagro","description":"Lectora curiosa que arma clubes pequeños alrededor de novelas familiares y contemporáneas.","interests":["fiction","romance","classics"],"visibility":"neighborhood","lat":-34.605,"lon":-58.415,"photo":"https://randomuser.me/api/portraits/women/44.jpg"},
        {"email":"seed.martin@entrelibros.local","name":"Martín Quiroga","alias":"martin.quiroga","city":"Buenos Aires","neighborhood":"Villa Urquiza","description":"Busca ciencia ficción, ensayo y conversaciones largas sobre cómo cambian las ciudades.","interests":["science-fiction","history","philosophy"],"visibility":"city","lat":-34.571,"lon":-58.485,"photo":"https://randomuser.me/api/portraits/men/32.jpg"},
        {"email":"seed.sofia@entrelibros.local","name":"Sofía Ledesma","alias":"sofia.ledesma","city":"Buenos Aires","neighborhood":"Belgrano","description":"Intercambia lecturas contemporáneas y prefiere encontrarse en bibliotecas tranquilas.","interests":["fiction","romance","contemporary"],"visibility":"neighborhood","lat":-34.562,"lon":-58.458,"photo":"https://randomuser.me/api/portraits/women/65.jpg"},
        {"email":"seed.clara@entrelibros.local","name":"Clara Benítez","alias":"clara.benitez","city":"Buenos Aires","neighborhood":"Palermo","description":"Organiza lecturas compartidas y cuida una pequeña biblioteca de barrio.","interests":["fiction","classics","poetry"],"visibility":"neighborhood","lat":-34.585,"lon":-58.414,"photo":"https://randomuser.me/api/portraits/women/12.jpg"},
        {"email":"seed.tomas@entrelibros.local","name":"Tomás Ferreyra","alias":"tomas.ferreyra","city":"Buenos Aires","neighborhood":"Chacarita","description":"Fan de la fantasía y la ciencia ficción; coordina intercambios en persona.","interests":["fantasy","science-fiction","adventure"],"visibility":"city","lat":-34.587,"lon":-58.452,"photo":"https://randomuser.me/api/portraits/men/75.jpg"},
        {"email":"seed.julieta@entrelibros.local","name":"Julieta Ríos","alias":"julieta.rios","city":"Buenos Aires","neighborhood":"Caballito","description":"Lee narrativa histórica y recomienda títulos para largas tardes de domingo.","interests":["history","fiction","classics"],"visibility":"neighborhood","lat":-34.618,"lon":-58.437,"photo":"https://randomuser.me/api/portraits/women/31.jpg"},
        {"email":"seed.pablo@entrelibros.local","name":"Pablo Acosta","alias":"pablo.acosta","city":"Buenos Aires","neighborhood":"Villa Crespo","description":"Colecciona novelas breves, cómics y autores nuevos de América Latina.","interests":["fiction","literary-fiction","comedy"],"visibility":"city","lat":-34.599,"lon":-58.443,"photo":"https://randomuser.me/api/portraits/men/41.jpg"},
        {"email":"seed.valentina@entrelibros.local","name":"Valentina Costa","alias":"valentina.costa","city":"Buenos Aires","neighborhood":"San Telmo","description":"Busca poesía, memorias y ediciones ilustradas para regalar o intercambiar.","interests":["poetry","memoir","art"],"visibility":"neighborhood","lat":-34.621,"lon":-58.374,"photo":"https://randomuser.me/api/portraits/women/49.jpg"},
        {"email":"seed.diego@entrelibros.local","name":"Diego Molina","alias":"diego.molina","city":"Buenos Aires","neighborhood":"Parque Patricios","description":"Lector de policiales y crónicas urbanas; siempre llega con una recomendación.","interests":["thriller","crime","history"],"visibility":"city","lat":-34.637,"lon":-58.405,"photo":"https://randomuser.me/api/portraits/men/46.jpg"},
        {"email":"seed.ana@entrelibros.local","name":"Ana Lectura","alias":"ana.lectura","city":"Buenos Aires","neighborhood":"Colegiales","description":"Combina literatura infantil, viajes y clubes de lectura con familias del barrio.","interests":["children","travel","fiction"],"visibility":"neighborhood","lat":-34.575,"lon":-58.451,"photo":"https://randomuser.me/api/portraits/women/68.jpg"},
        {"email":"seed.nicolas@entrelibros.local","name":"Nicolás Reyes","alias":"nicolas.reyes","city":"La Plata","neighborhood":"Tolosa","description":"Participa a distancia y coordina envíos cuando encuentra una edición difícil.","interests":["science-fiction","history","technology"],"visibility":"city","lat":-34.903,"lon":-57.955,"photo":"https://randomuser.me/api/portraits/men/52.jpg"},
        {"email":"seed.elena@entrelibros.local","name":"Elena Duarte","alias":"elena.duarte","city":"Buenos Aires","neighborhood":"Núñez","description":"Disfruta la narrativa latinoamericana y las conversaciones que siguen a una lectura.","interests":["fiction","latin-america","romance"],"visibility":"neighborhood","lat":-34.548,"lon":-58.461,"photo":"https://randomuser.me/api/portraits/women/26.jpg"}
      ]
    $users$::JSONB)
  LOOP
    INSERT INTO users (
      name, alias, email, password, role, language, profile_description,
      profile_visibility, location_visibility, interests, country, city,
      neighborhood, location, search_radius, profile_photo_url
    ) VALUES (
      item->>'name', item->>'alias', item->>'email',
      '$2b$10$YhaF/tEVbS.vLxZL0by4xuNvzWCas3OCxJaP/I3wCPSgmki4N5iby',
      'user', 'es', item->>'description', 'public', item->>'visibility',
      ARRAY(SELECT jsonb_array_elements_text(item->'interests')),
      'Argentina', item->>'city', item->>'neighborhood',
      ST_SetSRID(ST_MakePoint((item->>'lon')::DOUBLE PRECISION, (item->>'lat')::DOUBLE PRECISION), 4326)::geography,
      15, item->>'photo'
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      alias = EXCLUDED.alias,
      password = EXCLUDED.password,
      profile_description = EXCLUDED.profile_description,
      profile_visibility = EXCLUDED.profile_visibility,
      location_visibility = EXCLUDED.location_visibility,
      interests = EXCLUDED.interests,
      country = EXCLUDED.country,
      city = EXCLUDED.city,
      neighborhood = EXCLUDED.neighborhood,
      location = EXCLUDED.location,
      search_radius = EXCLUDED.search_radius,
      profile_photo_url = EXCLUDED.profile_photo_url
    RETURNING id INTO user_id;

    INSERT INTO seed_users (email, id) VALUES (item->>'email', user_id)
    ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id;
  END LOOP;
END
$seed_users$;

DO $seed_books$
DECLARE
  item JSONB;
  book_id INTEGER;
BEGIN
  FOR item IN
    SELECT jsonb_array_elements($books$
      [
        {"isbn":"9788437604794","title":"Rayuela","author":"Julio Cortázar","publisher":"Alfaguara","year":1963},
        {"isbn":"9788437604947","title":"Cien años de soledad","author":"Gabriel García Márquez","publisher":"Debolsillo","year":1967},
        {"isbn":"9788499890944","title":"1984","author":"George Orwell","publisher":"Debolsillo","year":1949},
        {"isbn":"9788478887194","title":"El principito","author":"Antoine de Saint-Exupéry","publisher":"Salamandra","year":1943},
        {"isbn":"9788491050299","title":"Orgullo y prejuicio","author":"Jane Austen","publisher":"Austral","year":1813},
        {"isbn":"9788437604944","title":"Crónica de una muerte anunciada","author":"Gabriel García Márquez","publisher":"Debolsillo","year":1981},
        {"isbn":"9788420633111","title":"El Aleph","author":"Jorge Luis Borges","publisher":"Alianza Editorial","year":1949},
        {"isbn":"9788408172179","title":"La sombra del viento","author":"Carlos Ruiz Zafón","publisher":"Planeta","year":2001},
        {"isbn":"9788416517271","title":"Los siete maridos de Evelyn Hugo","author":"Taylor Jenkins Reid","publisher":"Umbriel","year":2017},
        {"isbn":"9788497592208","title":"La casa de los espíritus","author":"Isabel Allende","publisher":"Debolsillo","year":1982},
        {"isbn":"9788401337208","title":"El nombre del viento","author":"Patrick Rothfuss","publisher":"Plaza & Janés","year":2008},
        {"isbn":"9788499926223","title":"Sapiens: de animales a dioses","author":"Yuval Noah Harari","publisher":"Debate","year":2011},
        {"isbn":"9788498382372","title":"Coraline","author":"Neil Gaiman","publisher":"Salamandra","year":2002},
        {"isbn":"9788445000760","title":"La mano izquierda de la oscuridad","author":"Ursula K. Le Guin","publisher":"Minotauro","year":1969},
        {"isbn":"9788417347087","title":"El problema de los tres cuerpos","author":"Cixin Liu","publisher":"Nova","year":2008},
        {"isbn":"9788497592457","title":"El amor en los tiempos del cólera","author":"Gabriel García Márquez","publisher":"Debolsillo","year":1985},
        {"isbn":"9788497594257","title":"Fahrenheit 451","author":"Ray Bradbury","publisher":"Debolsillo","year":1953},
        {"isbn":"9788497592444","title":"Persépolis","author":"Marjane Satrapi","publisher":"Reservoir Books","year":2000},
        {"isbn":"9788417860791","title":"El infinito en un junco","author":"Irene Vallejo","publisher":"Siruela","year":2019},
        {"isbn":"9788439722464","title":"Los detectives salvajes","author":"Roberto Bolaño","publisher":"Anagrama","year":1998},
        {"isbn":"9788483468680","title":"La carretera","author":"Cormac McCarthy","publisher":"Debolsillo","year":2006},
        {"isbn":"9788439722341","title":"El dios de las pequeñas cosas","author":"Arundhati Roy","publisher":"Anagrama","year":1997},
        {"isbn":"9788418015855","title":"Piranesi","author":"Susanna Clarke","publisher":"Alianza","year":2020},
        {"isbn":"9788497595728","title":"La vegetariana","author":"Han Kang","publisher":"Rata","year":2007},
        {"isbn":"9788439724703","title":"El año del pensamiento mágico","author":"Joan Didion","publisher":"Mondadori","year":2005},
        {"isbn":"9788413621658","title":"La biblioteca de la medianoche","author":"Matt Haig","publisher":"AdN","year":2020},
        {"isbn":"9788413140326","title":"El club de las cinco","author":"A.J. Finn","publisher":"Alfaguara","year":2019},
        {"isbn":"9788466347994","title":"La ridícula idea de no volver a verte","author":"Rosa Montero","publisher":"Seix Barral","year":2013},
        {"isbn":"9788423360793","title":"Los asquerosos","author":"Santiago Lorenzo","publisher":"Blackie Books","year":2018},
        {"isbn":"9788423354273","title":"Todo esto te daré","author":"Dolores Redondo","publisher":"Destino","year":2016}
      ]
    $books$::JSONB)
  LOOP
    SELECT id INTO book_id FROM books WHERE isbn = item->>'isbn' LIMIT 1;
    IF book_id IS NULL THEN
      INSERT INTO books (title, author, isbn, publisher, published_year, verified, language, format, cover_url)
      VALUES (
        item->>'title', item->>'author', item->>'isbn', item->>'publisher',
        (item->>'year')::INTEGER, true, 'es', 'paperback',
        'https://covers.openlibrary.org/b/isbn/' || (item->>'isbn') || '-M.jpg'
      ) RETURNING id INTO book_id;
    ELSE
      UPDATE books SET title = item->>'title', author = item->>'author', publisher = item->>'publisher',
        published_year = (item->>'year')::INTEGER, verified = true, language = 'es', format = 'paperback',
        cover_url = 'https://covers.openlibrary.org/b/isbn/' || (item->>'isbn') || '-M.jpg'
      WHERE id = book_id;
    END IF;
    INSERT INTO seed_books (isbn, id) VALUES (item->>'isbn', book_id)
    ON CONFLICT (isbn) DO UPDATE SET id = EXCLUDED.id;
  END LOOP;
END
$seed_books$;

DO $seed_corners$
DECLARE
  item RECORD;
  owner_id INTEGER;
BEGIN
  FOR item IN
    SELECT * FROM jsonb_to_recordset($corners$
      [
        {"key":"palermo","id":"4a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Biblioteca de Barrio Palermo","host":"Clara Benítez","owner":"seed.clara@entrelibros.local","rules":"Dejá un libro en buen estado y llevate otro que te acompañe.","schedule":"Miércoles de 17:00 a 20:00","street":"Güemes","number":"3300","postal":"1425","lat":-34.585,"lon":-58.414,"photo":"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85"},
        {"key":"chacarita","id":"5a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Rincón de Lectura Chacarita","host":"Tomás Ferreyra","owner":"seed.tomas@entrelibros.local","rules":"Intercambios coordinados con respeto y aviso previo.","schedule":"Sábados de 10:00 a 13:00","street":"Jorge Newbery","number":"1700","postal":"1426","lat":-34.587,"lon":-58.452,"photo":"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85"},
        {"key":"caballito","id":"6a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Mesa de Historia Caballito","host":"Julieta Ríos","owner":"seed.julieta@entrelibros.local","rules":"Conversamos sobre historia y dejamos espacio para nuevas voces.","schedule":"Jueves de 18:00 a 21:00","street":"Rivadavia","number":"5200","postal":"1424","lat":-34.618,"lon":-58.437,"photo":"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85"},
        {"key":"villa-crespo","id":"7a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Café de los Libros Villa Crespo","host":"Pablo Acosta","owner":"seed.pablo@entrelibros.local","rules":"Punto de encuentro vecinal; confirmá la visita antes de acercarte.","schedule":"Viernes de 16:00 a 19:00","street":"Loyola","number":"500","postal":"1414","lat":-34.599,"lon":-58.443,"photo":"https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=85"},
        {"key":"san-telmo","id":"8a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Patio de Lectura San Telmo","host":"Valentina Costa","owner":"seed.valentina@entrelibros.local","rules":"Traé una lectura y una pregunta para compartir.","schedule":"Domingos de 11:00 a 14:00","street":"Defensa","number":"900","postal":"1065","lat":-34.621,"lon":-58.374,"photo":"https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=85"},
        {"key":"parque-patricios","id":"9a089a74-4dfc-4531-a04c-883d3cd2233a","name":"Mesa Literaria Parque Patricios","host":"Diego Molina","owner":"seed.diego@entrelibros.local","rules":"Mesa abierta para compartir crónicas y coordinar intercambios.","schedule":"Sábados de 15:00 a 18:00","street":"Av. Caseros","number":"3200","postal":"1263","lat":-34.637,"lon":-58.405,"photo":"https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=85"},
        {"key":"colegiales","id":"aa089a74-4dfc-4531-a04c-883d3cd2233a","name":"Rincón Familiar Colegiales","host":"Ana Lectura","owner":"seed.ana@entrelibros.local","rules":"Un espacio amable para lecturas infantiles y familias.","schedule":"Sábados de 10:30 a 12:30","street":"Álvarez Thomas","number":"900","postal":"1427","lat":-34.575,"lon":-58.451,"photo":"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85"},
        {"key":"nunez","id":"ba089a74-4dfc-4531-a04c-883d3cd2233a","name":"Club del Río Núñez","host":"Elena Duarte","owner":"seed.elena@entrelibros.local","rules":"Leemos narrativa latinoamericana y cuidamos la privacidad del barrio.","schedule":"Martes de 18:30 a 20:30","street":"Arribeños","number":"2400","postal":"1428","lat":-34.548,"lon":-58.461,"photo":"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85"}
      ]
    $corners$::JSONB) AS x(key TEXT, id UUID, name TEXT, host TEXT, owner TEXT, rules TEXT, schedule TEXT, street TEXT, number TEXT, postal TEXT, lat NUMERIC, lon NUMERIC, photo TEXT)
  LOOP
    SELECT id INTO owner_id FROM seed_users WHERE email = item.owner;
    INSERT INTO community_corners (
      id, name, scope, host_alias, internal_contact, rules, schedule,
      visibility_preference, address_street, address_number, address_postal_code,
      status, draft, consent, location, editorial_status, owner_id
    ) VALUES (
      item.id, item.name, 'public', item.host, 'seed.' || item.key || '@entrelibros.local',
      item.rules, item.schedule, 'approximate', item.street, item.number, item.postal,
      'active', false, true, ST_SetSRID(ST_MakePoint(item.lon, item.lat), 4326)::geography,
      'approved', owner_id
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, host_alias = EXCLUDED.host_alias, rules = EXCLUDED.rules,
      schedule = EXCLUDED.schedule, address_street = EXCLUDED.address_street,
      address_number = EXCLUDED.address_number, address_postal_code = EXCLUDED.address_postal_code,
      status = EXCLUDED.status, draft = EXCLUDED.draft, consent = EXCLUDED.consent,
      location = EXCLUDED.location, editorial_status = EXCLUDED.editorial_status, owner_id = EXCLUDED.owner_id;

    INSERT INTO seed_corners (key, id) VALUES (item.key, item.id)
    ON CONFLICT (key) DO UPDATE SET id = EXCLUDED.id;

    INSERT INTO community_corner_photos (id, corner_id, external_id, url, is_primary)
    SELECT gen_random_uuid(), item.id, 'seed-local-' || item.key, item.photo, true
    WHERE NOT EXISTS (
      SELECT 1 FROM community_corner_photos WHERE corner_id = item.id AND is_primary = true
    );
    INSERT INTO community_corner_metrics (corner_id, total_exchanges, weekly_exchanges, last_activity_at)
    VALUES (item.id, 3, 1, NOW() - INTERVAL '2 hours')
    ON CONFLICT (corner_id) DO UPDATE SET total_exchanges = EXCLUDED.total_exchanges,
      weekly_exchanges = EXCLUDED.weekly_exchanges, last_activity_at = EXCLUDED.last_activity_at,
      updated_at = NOW();
  END LOOP;
END
$seed_corners$;

DO $seed_listings$
DECLARE
  item RECORD;
  v_user_id INTEGER;
  v_book_id INTEGER;
  v_listing_id INTEGER;
  v_listing_key TEXT;
BEGIN
  FOR item IN
    SELECT * FROM jsonb_to_recordset($listings$
      [
        {"user":"seed.lucia@entrelibros.local","isbn":"9788437604794","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"palermo","description":"Edición cuidada para conversar sobre memoria y juego."},
        {"user":"seed.lucia@entrelibros.local","isbn":"9788491050299","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"palermo","description":"Novela con algunas marcas, perfecta para un club de lectura."},
        {"user":"seed.lucia@entrelibros.local","isbn":"9788417860791","type":"offer","condition":"very_good","trade":false,"sale":true,"price":8500,"corner":"palermo","description":"Una edición nueva sobre la historia de los libros."},
        {"user":"seed.martin@entrelibros.local","isbn":"9788499890944","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"colegiales","description":"Edición subrayada con notas sobre tecnología y vigilancia."},
        {"user":"seed.martin@entrelibros.local","isbn":"9788445000760","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"colegiales","description":"Ciencia ficción clásica para intercambiar por otra saga."},
        {"user":"seed.martin@entrelibros.local","isbn":"9788417347087","type":"offer","condition":"new","trade":false,"sale":true,"price":12500,"corner":"colegiales","description":"Primera lectura de la trilogía, sin marcas."},
        {"user":"seed.sofia@entrelibros.local","isbn":"9788416517271","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"nunez","description":"Novela contemporánea para una lectora que quiera emocionarse."},
        {"user":"seed.sofia@entrelibros.local","isbn":"9788497592457","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"nunez","description":"Un clásico latinoamericano para leer despacio."},
        {"user":"seed.sofia@entrelibros.local","isbn":"9788497595728","type":"want","condition":null,"trade":false,"sale":false,"price":null,"corner":null,"description":"Busco una edición en español para conversar con mi grupo."},
        {"user":"seed.clara@entrelibros.local","isbn":"9788497592208","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"palermo","description":"Ejemplar cuidado con una dedicatoria antigua."},
        {"user":"seed.clara@entrelibros.local","isbn":"9788478887194","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"palermo","description":"Una lectura breve para compartir en familia."},
        {"user":"seed.clara@entrelibros.local","isbn":"9788498382372","type":"offer","condition":"new","trade":false,"sale":true,"price":7000,"corner":"palermo","description":"Edición ilustrada, ideal para lectores jóvenes."},
        {"user":"seed.tomas@entrelibros.local","isbn":"9788401337208","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"chacarita","description":"Libro leído varias veces y listo para otra aventura."},
        {"user":"seed.tomas@entrelibros.local","isbn":"9788418015855","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"chacarita","description":"Edición de bolsillo con mapas y notas del primer viaje."},
        {"user":"seed.tomas@entrelibros.local","isbn":"9788497594257","type":"offer","condition":"good","trade":false,"sale":true,"price":6000,"corner":"chacarita","description":"Distopía clásica con cubierta conservada."},
        {"user":"seed.julieta@entrelibros.local","isbn":"9788499926223","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"caballito","description":"Ensayo marcado con preguntas para una charla."},
        {"user":"seed.julieta@entrelibros.local","isbn":"9788420633111","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"caballito","description":"Cuentos de Borges para intercambiar por historia argentina."},
        {"user":"seed.julieta@entrelibros.local","isbn":"9788439724703","type":"want","condition":null,"trade":false,"sale":false,"price":null,"corner":null,"description":"Busco esta memoria para un encuentro sobre duelo y escritura."},
        {"user":"seed.pablo@entrelibros.local","isbn":"9788498382372","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"villa-crespo","description":"Una historia oscura que también funciona para adolescentes."},
        {"user":"seed.pablo@entrelibros.local","isbn":"9788439722464","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"villa-crespo","description":"Novela extensa para quien quiera perderse un mes."},
        {"user":"seed.pablo@entrelibros.local","isbn":"9788423360793","type":"offer","condition":"new","trade":false,"sale":true,"price":5200,"corner":"villa-crespo","description":"Edición nueva sobre la vida fuera de la ciudad."},
        {"user":"seed.valentina@entrelibros.local","isbn":"9788497592444","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"san-telmo","description":"Novela gráfica para conversar sobre identidad y memoria."},
        {"user":"seed.valentina@entrelibros.local","isbn":"9788439722341","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"san-telmo","description":"Una novela para intercambiar por poesía contemporánea."},
        {"user":"seed.valentina@entrelibros.local","isbn":"9788439724703","type":"offer","condition":"very_good","trade":false,"sale":true,"price":6500,"corner":"san-telmo","description":"Memoria personal en excelente estado."},
        {"user":"seed.diego@entrelibros.local","isbn":"9788483468680","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"parque-patricios","description":"Lectura intensa para conversar sobre supervivencia."},
        {"user":"seed.diego@entrelibros.local","isbn":"9788437604944","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"parque-patricios","description":"Crónica breve con una tapa un poco gastada."},
        {"user":"seed.diego@entrelibros.local","isbn":"9788423354273","type":"want","condition":null,"trade":false,"sale":false,"price":null,"corner":null,"description":"Busco una edición para recomendar en una sobremesa."},
        {"user":"seed.ana@entrelibros.local","isbn":"9788478887194","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"colegiales","description":"Edición para una primera lectura acompañada."},
        {"user":"seed.ana@entrelibros.local","isbn":"9788498382372","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"colegiales","description":"Un cuento inquietante para lectores curiosos."},
        {"user":"seed.ana@entrelibros.local","isbn":"9788413621658","type":"offer","condition":"new","trade":false,"sale":true,"price":9000,"corner":"colegiales","description":"Novela nueva sobre segundas oportunidades."},
        {"user":"seed.nicolas@entrelibros.local","isbn":"9788417347087","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"chacarita","description":"Ciencia ficción para intercambiar con lectores de La Plata."},
        {"user":"seed.nicolas@entrelibros.local","isbn":"9788445000760","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"chacarita","description":"Un clásico difícil de encontrar en español."},
        {"user":"seed.nicolas@entrelibros.local","isbn":"9788437604794","type":"want","condition":null,"trade":false,"sale":false,"price":null,"corner":null,"description":"Busco otra edición anotada de Rayuela."},
        {"user":"seed.elena@entrelibros.local","isbn":"9788437604947","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"nunez","description":"Una novela para leer en compañía y debatir sus finales."},
        {"user":"seed.elena@entrelibros.local","isbn":"9788497592457","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"nunez","description":"Edición de bolsillo con subrayados discretos."},
        {"user":"seed.elena@entrelibros.local","isbn":"9788417860791","type":"offer","condition":"new","trade":false,"sale":true,"price":11000,"corner":"nunez","description":"Ensayo nuevo para quien ama la historia cultural."},
        {"user":"seed.lucia@entrelibros.local","isbn":"9788497594257","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"palermo","description":"Otra distopía para comparar con 1984."},
        {"user":"seed.martin@entrelibros.local","isbn":"9788418015855","type":"offer","condition":"good","trade":true,"sale":false,"price":null,"corner":"colegiales","description":"Piranesi con notas sobre arquitectura y mundos posibles."},
        {"user":"seed.sofia@entrelibros.local","isbn":"9788420633111","type":"offer","condition":"very_good","trade":true,"sale":false,"price":null,"corner":"nunez","description":"Una selección de cuentos para el próximo encuentro."},
        {"user":"seed.clara@entrelibros.local","isbn":"9788413140326","type":"offer","condition":"new","trade":false,"sale":true,"price":7500,"corner":"palermo","description":"Un thriller para cambiar de género."}
      ]
    $listings$::JSONB) AS x("user" TEXT, isbn TEXT, type TEXT, condition TEXT, trade BOOLEAN, sale BOOLEAN, price NUMERIC, corner TEXT, description TEXT)
  LOOP
    SELECT id INTO v_user_id FROM seed_users WHERE email = item."user";
    SELECT id INTO v_book_id FROM seed_books WHERE isbn = item.isbn;
    v_listing_key := item."user" || '|' || item.isbn || '|' || item.type || '|' || COALESCE(item.corner, 'none');
    SELECT id INTO v_listing_id FROM seed_listings WHERE key = v_listing_key;
    IF v_listing_id IS NULL THEN
      SELECT p.id INTO v_listing_id
      FROM book_listings p
      WHERE p.user_id = v_user_id AND p.book_id = v_book_id AND p.type::TEXT = item.type
        AND p.is_draft = false AND COALESCE(p.corner_id, '') = COALESCE((SELECT id::TEXT FROM seed_corners WHERE key = item.corner), '');
    END IF;
    IF v_listing_id IS NULL THEN
      INSERT INTO book_listings (
        user_id, book_id, status, type, description, condition, sale, trade,
        availability, price_amount, price_currency, delivery_in_person,
        delivery_near_book_corner, is_draft, corner_id, content_consent,
        image_consent, rules_consent
      ) VALUES (
        v_user_id, v_book_id, 'available', item.type::publication_type, item.description,
        NULLIF(item.condition, '')::publication_condition, item.sale, item.trade,
        'public', item.price, CASE WHEN item.price IS NULL THEN NULL ELSE 'ARS' END,
        true, item.corner IS NOT NULL, false,
        (SELECT id::TEXT FROM seed_corners WHERE key = item.corner),
        true, true, true
      ) RETURNING id INTO v_listing_id;
    END IF;
    INSERT INTO seed_listings (key, id, user_id, book_id) VALUES (v_listing_key, v_listing_id, v_user_id, v_book_id)
    ON CONFLICT (key) DO UPDATE SET id = EXCLUDED.id, user_id = EXCLUDED.user_id, book_id = EXCLUDED.book_id;
  END LOOP;

  INSERT INTO book_listing_images (book_listing_id, url, is_primary, source, metadata)
  SELECT listing.id, book.cover_url, true, 'open-library', jsonb_build_object('seed', true, 'isbn', book.isbn)
  FROM seed_listings seeded
  JOIN book_listings listing ON listing.id = seeded.id
  JOIN books book ON book.id = listing.book_id
  WHERE book.cover_url IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM book_listing_images image WHERE image.book_listing_id = listing.id AND image.is_primary = true);
END
$seed_listings$;

DO $seed_social$
DECLARE
  item RECORD;
  v_user_id INTEGER;
  v_listing_id INTEGER;
BEGIN
  FOR item IN
    SELECT * FROM jsonb_to_recordset($stories$
      [
        {"user":"seed.lucia@entrelibros.local","isbn":"9788437604794","body":"Rayuela volvió a abrirme una conversación sobre memoria y juego.","image":"https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85"},
        {"user":"seed.tomas@entrelibros.local","isbn":"9788401337208","body":"¿Qué mundo fantástico volverían a visitar? Yo sigo pensando en Temerant.","image":null},
        {"user":"seed.julieta@entrelibros.local","isbn":"9788499926223","body":"Una lectura para mirar la historia con otros ojos y abrir una buena charla.","image":"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85"},
        {"user":"seed.valentina@entrelibros.local","isbn":"9788497592444","body":"La novela gráfica también puede ser una puerta para hablar de identidad.","image":null},
        {"user":"seed.ana@entrelibros.local","isbn":"9788478887194","body":"Hoy leí en voz alta y el grupo pidió repetir el capítulo final.","image":null},
        {"user":"seed.elena@entrelibros.local","isbn":"9788437604947","body":"Un final que merece una conversación larga y una mesa compartida.","image":"https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85"}
      ]
    $stories$::JSONB) AS x("user" TEXT, isbn TEXT, body TEXT, image TEXT)
  LOOP
    SELECT id INTO v_user_id FROM seed_users WHERE email = item."user";
    SELECT seeded.id INTO v_listing_id
    FROM seed_listings seeded
    JOIN books book ON book.id = seeded.book_id
    WHERE seeded.user_id = v_user_id AND book.isbn = item.isbn
    LIMIT 1;
    INSERT INTO community_stories (user_id, body, image_url, book_listing_id)
    SELECT v_user_id, item.body, item.image, v_listing_id
    WHERE NOT EXISTS (
      SELECT 1 FROM community_stories story
      WHERE story.user_id = v_user_id AND story.body = item.body
    );
  END LOOP;

  INSERT INTO user_follows (follower_id, followed_id)
  SELECT follower.id, followed.id FROM seed_users follower, seed_users followed
  WHERE follower.email IN ('seed.lucia@entrelibros.local','seed.sofia@entrelibros.local','seed.valentina@entrelibros.local')
    AND followed.email IN ('seed.clara@entrelibros.local','seed.tomas@entrelibros.local','seed.elena@entrelibros.local')
    AND follower.id <> followed.id
  ON CONFLICT DO NOTHING;

  INSERT INTO user_blocks (blocker_id, blocked_id)
  SELECT blocker.id, blocked.id FROM seed_users blocker, seed_users blocked
  WHERE blocker.email = 'seed.nicolas@entrelibros.local' AND blocked.email = 'seed.diego@entrelibros.local'
  ON CONFLICT DO NOTHING;

  INSERT INTO community_listing_likes (listing_id, user_id)
  SELECT listing.id, liker.id FROM seed_listings listing CROSS JOIN seed_users liker
  WHERE listing.key IN (
    'seed.lucia@entrelibros.local|9788437604794|offer|palermo',
    'seed.tomas@entrelibros.local|9788401337208|offer|chacarita',
    'seed.valentina@entrelibros.local|9788497592444|offer|san-telmo'
  ) AND liker.email IN ('seed.sofia@entrelibros.local','seed.clara@entrelibros.local','seed.ana@entrelibros.local')
  ON CONFLICT DO NOTHING;

  INSERT INTO community_story_likes (story_id, user_id)
  SELECT story.id, liker.id FROM community_stories story CROSS JOIN seed_users liker
  WHERE story.user_id IN (SELECT id FROM seed_users WHERE email IN ('seed.lucia@entrelibros.local','seed.tomas@entrelibros.local'))
    AND liker.email IN ('seed.sofia@entrelibros.local','seed.julieta@entrelibros.local','seed.elena@entrelibros.local')
  ON CONFLICT DO NOTHING;

  INSERT INTO community_comments (user_id, listing_id, body)
  SELECT commenter.id, listing.id, comment.body
  FROM (VALUES
    ('seed.sofia@entrelibros.local','seed.lucia@entrelibros.local|9788437604794|offer|palermo','La llevaría al próximo encuentro.'),
    ('seed.clara@entrelibros.local','seed.tomas@entrelibros.local|9788401337208|offer|chacarita','Tengo una edición para comparar finales.'),
    ('seed.elena@entrelibros.local','seed.valentina@entrelibros.local|9788497592444|offer|san-telmo','Me interesa sumarme a la conversación.')
  ) AS comment(commenter_email, listing_key, body)
  JOIN seed_users commenter ON commenter.email = comment.commenter_email
  JOIN seed_listings listing ON listing.key = comment.listing_key
  WHERE NOT EXISTS (SELECT 1 FROM community_comments existing WHERE existing.user_id = commenter.id AND existing.listing_id = listing.id AND existing.body = comment.body);
END
$seed_social$;

DO $seed_conversations$
DECLARE
  item RECORD;
  message RECORD;
  v_user_a INTEGER;
  v_user_b INTEGER;
  v_sender_id INTEGER;
  v_conversation_id BIGINT;
  v_message_sequence BIGINT;
  v_book_id INTEGER;
BEGIN
  FOR item IN
    SELECT * FROM jsonb_to_recordset($conversations$
      [
        {"key":"lucia-tomas","a":"seed.lucia@entrelibros.local","b":"seed.tomas@entrelibros.local","messages":[{"sender":"a","client":"seed-lucia-tomas-1","body":"Hola Tomás, vi tu ejemplar de El nombre del viento.","isbn":"9788401337208"},{"sender":"b","client":"seed-lucia-tomas-2","body":"¡Hola! Me interesa intercambiarlo por Rayuela o una buena recomendación."},{"sender":"a","client":"seed-lucia-tomas-3","body":"Podemos encontrarnos en el Rincón de Chacarita el sábado.","isbn":"9788437604794"}]},
        {"key":"sofia-clara","a":"seed.sofia@entrelibros.local","b":"seed.clara@entrelibros.local","messages":[{"sender":"a","client":"seed-sofia-clara-1","body":"Clara, ¿seguís teniendo La casa de los espíritus?","isbn":"9788497592208"},{"sender":"b","client":"seed-sofia-clara-2","body":"Sí, está muy cuidada. Busco una edición de Orgullo y prejuicio."},{"sender":"a","client":"seed-sofia-clara-3","body":"Tengo una con marcas suaves; te mando una propuesta.","isbn":"9788491050299"}]},
        {"key":"julieta-pablo","a":"seed.julieta@entrelibros.local","b":"seed.pablo@entrelibros.local","messages":[{"sender":"a","client":"seed-julieta-pablo-1","body":"Pablo, tu publicación de Los asquerosos me dio curiosidad.","isbn":"9788423360793"},{"sender":"b","client":"seed-julieta-pablo-2","body":"Es ideal para discutir ciudad y campo. ¿Qué te gustaría leer a cambio?"},{"sender":"a","client":"seed-julieta-pablo-3","body":"Puedo ofrecerte Sapiens y encontrarnos en Caballito.","isbn":"9788499926223"}]},
        {"key":"valentina-diego","a":"seed.valentina@entrelibros.local","b":"seed.diego@entrelibros.local","messages":[{"sender":"a","client":"seed-valentina-diego-1","body":"Diego, vi que buscabas crónicas urbanas."},{"sender":"b","client":"seed-valentina-diego-2","body":"Sí, y tu recomendación de Persépolis me encantó.","isbn":"9788497592444"},{"sender":"a","client":"seed-valentina-diego-3","body":"Te guardo un ejemplar para el encuentro de San Telmo."}]},
        {"key":"ana-elena","a":"seed.ana@entrelibros.local","b":"seed.elena@entrelibros.local","messages":[{"sender":"a","client":"seed-ana-elena-1","body":"Elena, ¿te sumás al club de lectura familiar?"},{"sender":"b","client":"seed-ana-elena-2","body":"Sí, puedo llevar Cien años de soledad para la charla.","isbn":"9788437604947"},{"sender":"a","client":"seed-ana-elena-3","body":"Perfecto, nos vemos el sábado en Colegiales."}]},
        {"key":"martin-nicolas","a":"seed.martin@entrelibros.local","b":"seed.nicolas@entrelibros.local","messages":[{"sender":"a","client":"seed-martin-nicolas-1","body":"Nicolás, ¿conseguís la segunda parte de la trilogía?"},{"sender":"b","client":"seed-martin-nicolas-2","body":"Todavía no, pero tengo El problema de los tres cuerpos.","isbn":"9788417347087"},{"sender":"a","client":"seed-martin-nicolas-3","body":"Lo intercambio por una edición anotada de Ursula Le Guin.","isbn":"9788445000760"}]},
        {"key":"lucia-julieta","a":"seed.lucia@entrelibros.local","b":"seed.julieta@entrelibros.local","messages":[{"sender":"a","client":"seed-lucia-julieta-1","body":"Julieta, tu encuentro de historia parece interesante."},{"sender":"b","client":"seed-lucia-julieta-2","body":"Traé Rayuela y hablamos de memoria y archivo.","isbn":"9788437604794"},{"sender":"a","client":"seed-lucia-julieta-3","body":"Confirmo mi asistencia para el jueves."}]},
        {"key":"tomas-sofia","a":"seed.tomas@entrelibros.local","b":"seed.sofia@entrelibros.local","messages":[{"sender":"a","client":"seed-tomas-sofia-1","body":"Sofía, ¿te interesa Piranesi?","isbn":"9788418015855"},{"sender":"b","client":"seed-tomas-sofia-2","body":"Sí, puedo ofrecerte Los siete maridos de Evelyn Hugo.","isbn":"9788416517271"},{"sender":"a","client":"seed-tomas-sofia-3","body":"Armemos una propuesta y elegimos un rincón seguro."}]}
      ]
    $conversations$::JSONB) AS x(key TEXT, a TEXT, b TEXT, messages JSONB)
  LOOP
    SELECT id INTO v_user_a FROM seed_users WHERE email = item.a;
    SELECT id INTO v_user_b FROM seed_users WHERE email = item.b;
    SELECT c.id INTO v_conversation_id
    FROM conversations c
    WHERE EXISTS (SELECT 1 FROM conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = v_user_a)
      AND EXISTS (SELECT 1 FROM conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = v_user_b)
      AND (SELECT COUNT(*) FROM conversation_participants p WHERE p.conversation_id = c.id) = 2
    LIMIT 1;
    IF v_conversation_id IS NULL THEN
      INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;
      INSERT INTO conversation_participants (conversation_id, user_id) VALUES (v_conversation_id, v_user_a), (v_conversation_id, v_user_b);
    END IF;
    INSERT INTO seed_conversations (key, id, user_a, user_b) VALUES (item.key, v_conversation_id, v_user_a, v_user_b)
    ON CONFLICT (key) DO UPDATE SET id = EXCLUDED.id, user_a = EXCLUDED.user_a, user_b = EXCLUDED.user_b;

    FOR message IN SELECT * FROM jsonb_to_recordset(item.messages) AS m(sender TEXT, client TEXT, body TEXT, isbn TEXT)
    LOOP
      v_sender_id := CASE WHEN message.sender = 'a' THEN v_user_a ELSE v_user_b END;
      IF NOT EXISTS (SELECT 1 FROM messages stored_message WHERE stored_message.conversation_id = v_conversation_id AND stored_message.client_key = message.client) THEN
        UPDATE conversations SET last_message_sequence = last_message_sequence + 1, updated_at = NOW()
        WHERE id = v_conversation_id RETURNING last_message_sequence INTO v_message_sequence;
        IF message.isbn IS NULL THEN
          INSERT INTO messages (conversation_id, sender_id, sequence, client_key, body) VALUES (v_conversation_id, v_sender_id, v_message_sequence, message.client, message.body);
        ELSE
          SELECT id INTO v_book_id FROM seed_books WHERE isbn = message.isbn;
          INSERT INTO messages (conversation_id, sender_id, sequence, client_key, body, attachment_metadata)
          SELECT v_conversation_id, v_sender_id, v_message_sequence, message.client, message.body,
            jsonb_build_object('kind','book','bookId',book.id::TEXT,'title',book.title,'author',book.author,'coverUrl',book.cover_url)
          FROM books book WHERE book.id = v_book_id;
        END IF;
      END IF;
    END LOOP;
    UPDATE conversation_participants AS participant
    SET last_read_sequence = CASE WHEN participant.user_id = v_user_a THEN 1 ELSE 0 END
    WHERE participant.conversation_id = v_conversation_id;
  END LOOP;
END
$seed_conversations$;

-- Drafts are persisted separately from sent messages. They are intentionally
-- not copied into the message history, unread counters, or notifications.
INSERT INTO message_drafts (conversation_id, author_id, body, revision)
SELECT seeded.id, seeded.user_a, draft.body, 1
FROM seed_conversations seeded
JOIN (VALUES
  ('lucia-tomas', '¿Te parece si llevamos Rayuela y El nombre del viento al próximo encuentro?'),
  ('sofia-clara', 'Quiero revisar la edición antes de confirmar el intercambio.'),
  ('julieta-pablo', 'Podemos comparar las dos propuestas en el Rincón de Caballito.'),
  ('valentina-diego', 'Te escribo cuando tenga confirmado el horario de San Telmo.'),
  ('ana-elena', 'También podemos invitar a quienes leen con sus familias.'),
  ('martin-nicolas', 'Si aparece la segunda parte, coordinamos un envío conjunto.'),
  ('lucia-julieta', 'Llevo algunas preguntas sobre memoria y archivo.'),
  ('tomas-sofia', 'Voy a revisar el estado de Piranesi antes de armar la propuesta.')
) AS draft(conversation_key, body) ON draft.conversation_key = seeded.key
ON CONFLICT (conversation_id, author_id) DO UPDATE
SET body = EXCLUDED.body, revision = message_drafts.revision + 1, updated_at = NOW();

DO $seed_agreements$
DECLARE
  item RECORD;
  v_agreement_id BIGINT;
  v_conversation_id BIGINT;
  v_proposer_id INTEGER;
  v_participant_id INTEGER;
  v_version INTEGER;
  v_proposer_listing INTEGER;
  v_participant_listing INTEGER;
BEGIN
  FOR item IN
    SELECT * FROM jsonb_to_recordset($agreements$
      [
        {"conversation":"lucia-tomas","proposer":"seed.lucia@entrelibros.local","participant":"seed.tomas@entrelibros.local","proposer_isbn":"9788437604794","participant_isbn":"9788401337208","state":"confirmed","event":"confirm","outcome":null},
        {"conversation":"sofia-clara","proposer":"seed.sofia@entrelibros.local","participant":"seed.clara@entrelibros.local","proposer_isbn":"9788497592457","participant_isbn":"9788497592208","state":"completed","event":"complete","outcome":"completed"},
        {"conversation":"julieta-pablo","proposer":"seed.julieta@entrelibros.local","participant":"seed.pablo@entrelibros.local","proposer_isbn":"9788499926223","participant_isbn":"9788423360793","state":"proposed","event":"proposal","outcome":null},
        {"conversation":"valentina-diego","proposer":"seed.valentina@entrelibros.local","participant":"seed.diego@entrelibros.local","proposer_isbn":"9788497592444","participant_isbn":"9788483468680","state":"cancelled","event":"cancel","outcome":"not_completed"}
      ]
    $agreements$::JSONB) AS x(conversation TEXT, proposer TEXT, participant TEXT, proposer_isbn TEXT, participant_isbn TEXT, state TEXT, event TEXT, outcome TEXT)
  LOOP
    SELECT id INTO v_conversation_id FROM seed_conversations WHERE key = item.conversation;
    SELECT id INTO v_proposer_id FROM seed_users WHERE email = item.proposer;
    SELECT id INTO v_participant_id FROM seed_users WHERE email = item.participant;
    SELECT id INTO v_proposer_listing FROM seed_listings WHERE user_id = v_proposer_id AND book_id = (SELECT id FROM seed_books WHERE isbn = item.proposer_isbn);
    SELECT id INTO v_participant_listing FROM seed_listings WHERE user_id = v_participant_id AND book_id = (SELECT id FROM seed_books WHERE isbn = item.participant_isbn);
    INSERT INTO exchange_agreements (conversation_id, proposer_id, participant_id, state, current_version)
    VALUES (v_conversation_id, v_proposer_id, v_participant_id, item.state, 1)
    ON CONFLICT (conversation_id) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
    RETURNING id, current_version INTO v_agreement_id, v_version;
    INSERT INTO exchange_agreement_versions (agreement_id, version, actor_id, state, details)
    VALUES (v_agreement_id, v_version, v_proposer_id, item.state, jsonb_build_object('meetingPoint','Rincón de Lectura Chacarita','area','Buenos Aires','date','2026-09-20','time','11:00','bookTitle',item.participant_isbn))
    ON CONFLICT (agreement_id, version) DO NOTHING;
    INSERT INTO exchange_agreement_items (agreement_id, version, listing_id, owner_id)
    VALUES (v_agreement_id, v_version, v_proposer_listing, v_proposer_id), (v_agreement_id, v_version, v_participant_listing, v_participant_id)
    ON CONFLICT DO NOTHING;
    INSERT INTO exchange_agreement_acceptances (agreement_id, version, user_id)
    SELECT v_agreement_id, v_version, v_proposer_id
    WHERE item.state IN ('confirmed','completed')
    ON CONFLICT DO NOTHING;
    INSERT INTO exchange_agreement_acceptances (agreement_id, version, user_id)
    SELECT v_agreement_id, v_version, v_participant_id
    WHERE item.state IN ('confirmed','completed')
    ON CONFLICT DO NOTHING;
    INSERT INTO agreement_events (agreement_id, version, actor_id, event_type)
    SELECT v_agreement_id, v_version, v_proposer_id, item.event
    WHERE NOT EXISTS (
      SELECT 1 FROM agreement_events existing_event
      WHERE existing_event.agreement_id = v_agreement_id
        AND existing_event.version = v_version
        AND existing_event.event_type = item.event
    );
    IF item.outcome IS NOT NULL THEN
      INSERT INTO exchange_agreement_outcomes (agreement_id, user_id, outcome, reason)
      VALUES (v_agreement_id, v_proposer_id, item.outcome, 'Estado sembrado para el recorrido local')
      ON CONFLICT (agreement_id, user_id) DO UPDATE SET outcome = EXCLUDED.outcome, reason = EXCLUDED.reason;
    END IF;
    INSERT INTO notifications (recipient_id, kind, entity_id, title_key, body_key, data, idempotency_key)
    VALUES (v_participant_id, 'agreement', v_agreement_id::TEXT, 'notifications.agreement.' || item.state, 'notifications.agreement.confirmedWith', jsonb_build_object('state', item.state, 'participantName', (SELECT name FROM users WHERE id = v_proposer_id)), 'seed-agreement-' || item.conversation)
    ON CONFLICT (idempotency_key) DO NOTHING;
  END LOOP;
END
$seed_agreements$;

INSERT INTO analytics_events (event_type, actor_id, entity_type, entity_id, metadata, occurred_at, idempotency_key)
SELECT event_type, actor.id, entity_type, entity_id, metadata, occurred_at, idempotency_key
FROM (VALUES
  ('listing_published','seed.lucia@entrelibros.local','listing','seed.lucia-rayuela','{}'::JSONB,NOW() - INTERVAL '2 days','seed-analytics-listing-lucia'),
  ('listing_published','seed.tomas@entrelibros.local','listing','seed.tomas-nombre-viento','{}'::JSONB,NOW() - INTERVAL '5 days','seed-analytics-listing-tomas'),
  ('contact_started','seed.sofia@entrelibros.local','conversation','seed-sofia-clara','{}'::JSONB,NOW() - INTERVAL '4 days','seed-analytics-contact-sofia'),
  ('agreement_created','seed.julieta@entrelibros.local','conversation','seed-julieta-pablo','{}'::JSONB,NOW() - INTERVAL '3 days','seed-analytics-agreement-julieta'),
  ('agreement_confirmed','seed.lucia@entrelibros.local','agreement','seed-lucia-tomas','{}'::JSONB,NOW() - INTERVAL '1 day','seed-analytics-confirmed-lucia'),
  ('outcome_recorded','seed.sofia@entrelibros.local','agreement','seed-sofia-clara','{"outcome":"completed"}'::JSONB,NOW() - INTERVAL '12 hours','seed-analytics-outcome-sofia')
) AS event(event_type, actor_email, entity_type, entity_id, metadata, occurred_at, idempotency_key)
JOIN seed_users actor ON actor.email = event.actor_email
ON CONFLICT (idempotency_key) DO NOTHING;

COMMIT;
