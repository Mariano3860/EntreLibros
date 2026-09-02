import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import * as openLibrary from '../../src/services/openLibrary.js';
import jwt, { type Algorithm } from 'jsonwebtoken';

let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
  vi.spyOn(openLibrary, 'checkBookExists').mockResolvedValue(false);
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_ALGORITHM = 'HS256';
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
  vi.restoreAllMocks();
});

const insertUser = async (
  overrides: Partial<{ name: string; email: string }>
): Promise<number> => {
  const name = overrides.name ?? 'User';
  const email =
    overrides.email ?? `${Math.random().toString(36).slice(2)}@example.com`;
  const { rows } = await client.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, 'hash', 'user') RETURNING id",
    [name, email]
  );
  return rows[0].id as number;
};

const insertBook = async (): Promise<number> => {
  const { rows } = await client.query(
    'INSERT INTO books (title, author, publisher, published_year, language, format, isbn, cover_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
    [
      'Libro test',
      'Autor',
      'Editorial',
      2020,
      'es',
      'tapa dura',
      '9781234567890',
      'https://covers.example.com/book.jpg',
    ]
  );
  return rows[0].id as number;
};

const insertListing = async (params: {
  userId: number;
  bookId: number;
  status?:
    | 'available'
    | 'reserved'
    | 'draft'
    | 'inactive'
    | 'completed'
    | 'sold'
    | 'exchanged';
  condition?: 'new' | 'very_good' | 'good' | 'acceptable' | null;
  availability?: 'public' | 'private';
  isDraft?: boolean;
  notes?: string | null;
  sale?: boolean;
  donation?: boolean;
  trade?: boolean;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  tradePreferences?: string[];
  cornerId?: string | null;
}): Promise<number> => {
  const {
    userId,
    bookId,
    status = 'available',
    condition = 'good',
    availability = 'public',
    isDraft = false,
    notes = 'Notas iniciales',
    sale = true,
    donation = false,
    trade = true,
    priceAmount = 50,
    priceCurrency = 'ARS',
    tradePreferences = ['intercambio'],
    cornerId = 'corner-1',
  } = params;

  const { rows } = await client.query(
    `INSERT INTO book_listings (
      user_id,
      book_id,
      status,
      type,
      description,
      condition,
      sale,
      donation,
      trade,
      price_amount,
      price_currency,
      trade_preferences,
      availability,
      is_draft,
      delivery_near_book_corner,
      delivery_in_person,
      delivery_shipping,
      delivery_shipping_payer,
      corner_id
    ) VALUES (
      $1, $2, $3, 'offer', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
       true, true, false, NULL, $14
    ) RETURNING id`,
    [
      userId,
      bookId,
      status,
      notes,
      condition,
      sale,
      donation,
      trade,
      sale ? priceAmount : null,
      sale ? priceCurrency : null,
      tradePreferences,
      availability,
      isDraft,
      cornerId,
    ]
  );

  return rows[0].id as number;
};

const insertImage = async (
  listingId: number,
  url: string,
  isPrimary: boolean
): Promise<void> => {
  await client.query(
    `INSERT INTO book_listing_images (book_listing_id, url, is_primary, source, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [listingId, url, isPrimary, 'upload', JSON.stringify({ source: 'upload' })]
  );
};

const buildAuthCookie = (userId: number) => {
  const algorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'testsecret',
    {
      algorithm,
    }
  );
  return `sessionToken=${token}`;
};

describe('books API legacy endpoints', () => {
  test('requires q for search', async () => {
    const res = await request(app).get('/api/books/search').expect(400);
    expect(res.body).toEqual({
      error: 'q_required',
      message: 'Missing q (or query) parameter',
    });
  });

  test('returns search error when OpenLibrary fails', async () => {
    vi.spyOn(openLibrary, 'searchBooksApiResults').mockRejectedValueOnce(
      new Error('fail')
    );

    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'foo' })
      .expect(502);

    expect(res.body).toEqual({
      error: 'openlibrary_error: Error: fail',
    });
  });

  test('returns array of ApiBookSearchResult on success', async () => {
    const payload = [
      {
        id: 'OL9999M',
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        publisher: 'DAW',
        year: 2007,
        language: 'spa',
        isbn: '9788401337208',
        coverUrl: 'https://covers.openlibrary.org/b/id/321-M.jpg',
      },
      {
        id: 'OL8888M',
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        publisher: 'DAW',
        year: 2007,
        language: 'eng',
        isbn: '9780756404741',
        coverUrl: 'https://covers.openlibrary.org/b/id/322-M.jpg',
      },
    ];

    vi.spyOn(openLibrary, 'searchBooksApiResults').mockResolvedValueOnce(
      payload
    );

    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'el nombre del viento' })
      .expect(200);

    expect(res.body).toEqual(payload);
  });

  test('returns not found when verifying missing book', async () => {
    const userId = await insertUser({ name: 'Verifier' });
    const res = await request(app)
      .post('/api/books/123/verify')
      .set('Cookie', buildAuthCookie(userId))
      .expect(404);
    expect(res.body).toEqual({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  });
});

describe('books API listing projections', () => {
  test('returns UI status in public listings', async () => {
    const userId = await insertUser({ name: 'Publicador' });
    const bookId = await insertBook();
    await insertListing({ userId, bookId, status: 'available' });

    const res = await request(app).get('/api/books').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      status: 'available',
      bookListingStatus: 'available',
    });
  });

  test('prioritizes followed readers in the home book rail', async () => {
    const viewerId = await insertUser({ name: 'Home viewer' });
    const followedId = await insertUser({ name: 'Followed reader' });
    const randomId = await insertUser({ name: 'Random reader' });
    const privateId = await insertUser({ name: 'Private reader' });
    const expiredId = await insertUser({ name: 'Expired reader' });
    const blockedId = await insertUser({ name: 'Blocked reader' });
    const viewerBookId = await insertBook();
    const followedBookId = await insertBook();
    const randomBookId = await insertBook();
    const privateBookId = await insertBook();
    const expiredBookId = await insertBook();
    const blockedBookId = await insertBook();
    const viewerListingId = await insertListing({
      userId: viewerId,
      bookId: viewerBookId,
    });
    const followedListingId = await insertListing({
      userId: followedId,
      bookId: followedBookId,
    });
    const randomListingId = await insertListing({
      userId: randomId,
      bookId: randomBookId,
    });
    const privateListingId = await insertListing({
      userId: privateId,
      bookId: privateBookId,
      availability: 'private',
    });
    const expiredListingId = await insertListing({
      userId: expiredId,
      bookId: expiredBookId,
    });
    const blockedListingId = await insertListing({
      userId: blockedId,
      bookId: blockedBookId,
    });
    await client.query(
      "UPDATE book_listings SET expires_at = NOW() - INTERVAL '1 day' WHERE id = $1",
      [expiredListingId]
    );
    await client.query(
      'INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2)',
      [viewerId, followedId]
    );
    await client.query(
      'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)',
      [viewerId, blockedId]
    );

    const res = await request(app)
      .get('/api/books/home')
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200);

    const ids = res.body.items.map((listing: { id: string }) => listing.id);
    expect(ids[0]).toBe(String(followedListingId));
    expect(ids).toContain(String(randomListingId));
    expect(ids).not.toContain(String(viewerListingId));
    expect(ids).not.toContain(String(privateListingId));
    expect(ids).not.toContain(String(expiredListingId));
    expect(ids).not.toContain(String(blockedListingId));
    expect(res.body.page).toMatchObject({
      limit: 5,
      offset: 0,
      hasPrevious: false,
    });
  });

  test('paginates home recommendations in groups of at most five', async () => {
    const viewerId = await insertUser({ name: 'Home viewer' });
    const bookId = await insertBook();
    await Promise.all(
      Array.from({ length: 6 }, async (_, index) => {
        const readerId = await insertUser({ name: `Reader ${index}` });
        return insertListing({ userId: readerId, bookId });
      })
    );

    const firstPage = await request(app)
      .get('/api/books/home')
      .query({ limit: 12 })
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200);

    expect(firstPage.body.items).toHaveLength(5);
    expect(firstPage.body.page).toEqual({
      limit: 5,
      offset: 0,
      hasNext: true,
      hasPrevious: false,
    });

    const secondPage = await request(app)
      .get('/api/books/home')
      .query({ offset: 5 })
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200);

    expect(secondPage.body.items).toHaveLength(5);
    expect(
      secondPage.body.items.map((item: { id: string }) => item.id)
    ).not.toContain(firstPage.body.items[0].id);
    expect(secondPage.body.page).toMatchObject({
      limit: 5,
      offset: 5,
      hasPrevious: true,
    });
  });

  test('rejects invalid home recommendation pagination', async () => {
    const res = await request(app)
      .get('/api/books/home')
      .query({ offset: -1 })
      .expect(400);

    expect(res.body).toEqual({
      error: 'InvalidFields',
      message: 'books.errors.invalid_filters',
    });
  });

  test('filters public listings and excludes expired entries', async () => {
    const userId = await insertUser({ name: 'Buscador' });
    const bookId = await insertBook();
    const activeId = await insertListing({ userId, bookId });
    const expiredId = await insertListing({ userId, bookId });
    await client.query(
      "UPDATE book_listings SET expires_at = NOW() - INTERVAL '1 day' WHERE id = $1",
      [expiredId]
    );

    const res = await request(app)
      .get('/api/books')
      .query({ q: 'Libro', author: 'Autor', language: 'es', limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(String(activeId));
  });

  test('translates internal statuses for owner listings', async () => {
    const userId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const availableId = await insertListing({
      userId,
      bookId,
      status: 'available',
    });
    const inactiveSoldId = await insertListing({
      userId,
      bookId,
      status: 'inactive',
      sale: true,
      trade: false,
    });
    const inactiveExchangeId = await insertListing({
      userId,
      bookId,
      status: 'inactive',
      sale: false,
      trade: true,
    });
    const inactiveCompletedId = await insertListing({
      userId,
      bookId,
      status: 'inactive',
      sale: false,
      trade: false,
      donation: true,
    });
    const soldId = await insertListing({
      userId,
      bookId,
      status: 'sold',
      sale: true,
      trade: false,
    });
    const exchangedId = await insertListing({
      userId,
      bookId,
      status: 'exchanged',
      sale: false,
      trade: true,
    });
    const completedId = await insertListing({
      userId,
      bookId,
      status: 'completed',
      sale: false,
      trade: false,
      donation: true,
    });

    const res = await request(app)
      .get('/api/books/mine')
      .set('Cookie', buildAuthCookie(userId))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const findListing = (id: number) =>
      res.body.find((listing: { id: string }) => listing.id === String(id));

    const availableListing = findListing(availableId);
    expect(availableListing).toBeDefined();
    expect(availableListing).toMatchObject({
      status: 'available',
      bookListingStatus: 'available',
    });

    const soldLegacyListing = findListing(inactiveSoldId);
    expect(soldLegacyListing).toBeDefined();
    expect(soldLegacyListing).toMatchObject({
      status: 'sold',
      bookListingStatus: 'sold',
    });

    const exchangedLegacyListing = findListing(inactiveExchangeId);
    expect(exchangedLegacyListing).toBeDefined();
    expect(exchangedLegacyListing).toMatchObject({
      status: 'exchanged',
      bookListingStatus: 'exchanged',
    });

    const completedLegacyListing = findListing(inactiveCompletedId);
    expect(completedLegacyListing).toBeDefined();
    expect(completedLegacyListing).toMatchObject({
      status: 'completed',
      bookListingStatus: 'completed',
    });

    const soldListing = findListing(soldId);
    expect(soldListing).toBeDefined();
    expect(soldListing).toMatchObject({
      status: 'sold',
      bookListingStatus: 'sold',
    });

    const exchangedListing = findListing(exchangedId);
    expect(exchangedListing).toBeDefined();
    expect(exchangedListing).toMatchObject({
      status: 'exchanged',
      bookListingStatus: 'exchanged',
    });

    const completedListing = findListing(completedId);
    expect(completedListing).toBeDefined();
    expect(completedListing).toMatchObject({
      status: 'completed',
      bookListingStatus: 'completed',
    });
  });
});

describe('books API discovery interactions', () => {
  test('applies combined condition, availability and modality filters', async () => {
    const targetOwnerId = await insertUser({ name: 'Target owner' });
    const otherOwnerId = await insertUser({ name: 'Other owner' });
    const targetBookId = await insertBook();
    const otherBookId = await insertBook();
    await client.query('UPDATE books SET title = $1 WHERE id = $2', [
      'Filtro objetivo unico',
      targetBookId,
    ]);
    const targetListingId = await insertListing({
      userId: targetOwnerId,
      bookId: targetBookId,
      condition: 'very_good',
      sale: false,
      trade: true,
    });
    await insertListing({
      userId: otherOwnerId,
      bookId: otherBookId,
      condition: 'good',
      sale: false,
      trade: true,
    });

    const res = await request(app)
      .get('/api/books')
      .query({
        q: 'Filtro objetivo unico',
        condition: 'very_good',
        status: 'available',
        trade: 'true',
        sale: 'false',
      })
      .expect(200);

    expect(res.body.map((listing: { id: string }) => listing.id)).toEqual([
      String(targetListingId),
    ]);
  });

  test('combines topic and reading-interest filters with the catalog query', async () => {
    const ownerId = await insertUser({ name: 'Topic owner' });
    const targetBookId = await insertBook();
    const otherBookId = await insertBook();
    await client.query('UPDATE books SET title = $1 WHERE id = $2', [
      'Historias de astronomía',
      targetBookId,
    ]);
    await client.query('UPDATE books SET title = $1 WHERE id = $2', [
      'Recetas familiares',
      otherBookId,
    ]);
    const targetListingId = await insertListing({
      userId: ownerId,
      bookId: targetBookId,
      notes: 'Ciencia y exploración del espacio.',
      tradePreferences: ['ciencia-ficcion'],
    });
    await insertListing({
      userId: ownerId,
      bookId: otherBookId,
      notes: 'Cocina y memoria familiar.',
      tradePreferences: ['cocina'],
    });

    const response = await request(app)
      .get('/api/books')
      .query({ topic: 'astronomía', interest: 'ciencia-ficcion' })
      .expect(200);

    expect(response.body.map((listing: { id: string }) => listing.id)).toEqual([
      String(targetListingId),
    ]);
  });

  test('rejects unsupported catalog filters', async () => {
    const res = await request(app)
      .get('/api/books')
      .query({ trade: 'sometimes', sort: 'random' })
      .expect(400);

    expect(res.body).toEqual({
      error: 'InvalidFields',
      message: 'books.errors.invalid_filters',
    });
  });

  test('persists and toggles interest on another reader publication', async () => {
    const ownerId = await insertUser({ name: 'Interest owner' });
    const viewerId = await insertUser({ name: 'Interest viewer' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });

    const initial = await request(app)
      .get('/api/books')
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200);
    expect(
      initial.body.find((item: { id: string }) => item.id === String(listingId))
    ).toMatchObject({
      isInterested: false,
    });

    await request(app)
      .post(`/api/books/${listingId}/interest`)
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200, { listingId: String(listingId), interested: true });

    const persisted = await request(app)
      .get('/api/books')
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200);
    expect(
      persisted.body.find(
        (item: { id: string }) => item.id === String(listingId)
      )
    ).toMatchObject({
      isInterested: true,
    });

    await request(app)
      .post(`/api/books/${listingId}/interest`)
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(200, { listingId: String(listingId), interested: false });

    const relations = await client.query(
      'SELECT 1 FROM user_book_listing_interests WHERE user_id = $1 AND book_listing_id = $2',
      [viewerId, listingId]
    );
    expect(relations.rows).toHaveLength(0);
  });

  test('protects interest actions from guests and publication owners', async () => {
    const ownerId = await insertUser({ name: 'Interest owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });

    await request(app).post(`/api/books/${listingId}/interest`).expect(401);
    const res = await request(app)
      .post(`/api/books/${listingId}/interest`)
      .set('Cookie', buildAuthCookie(ownerId))
      .expect(403);
    expect(res.body).toEqual({
      error: 'Forbidden',
      message: 'books.errors.interest_own',
    });
  });

  test('creates a want publication without offer data and prevents duplicates', async () => {
    const userId = await insertUser({ name: 'Want reader' });
    const payload = {
      type: 'want',
      metadata: {
        title: 'Libro que quiero encontrar',
        author: 'Autora buscada',
        isbn: '9780140328721',
      },
      consents: { content: true, image: true, rules: true },
      notes: 'Preferentemente en español',
    };

    const created = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(payload)
      .expect(201);
    expect(created.body).toMatchObject({
      type: 'want',
      isSeeking: true,
      status: 'available',
      notes: 'Preferentemente en español',
    });
    expect(created.body.condition).toBeUndefined();

    const duplicate = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(payload)
      .expect(409);
    expect(duplicate.body).toEqual({
      error: 'DuplicateWant',
      message: 'books.errors.want_duplicate',
    });

    const listings = await client.query(
      "SELECT COUNT(*)::int AS count FROM book_listings WHERE user_id = $1 AND type = 'want'",
      [userId]
    );
    expect(listings.rows[0].count).toBe(1);
  });

  test('creates a want publication from another reader listing', async () => {
    const ownerId = await insertUser({ name: 'Source owner' });
    const viewerId = await insertUser({ name: 'Want viewer' });
    const bookId = await insertBook();
    const sourceListingId = await insertListing({ userId: ownerId, bookId });

    const created = await request(app)
      .post(`/api/books/${sourceListingId}/want`)
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(201);
    expect(created.body).toMatchObject({ type: 'want', isSeeking: true });

    await request(app)
      .post(`/api/books/${sourceListingId}/want`)
      .set('Cookie', buildAuthCookie(viewerId))
      .expect(409);

    const own = await request(app)
      .post(`/api/books/${sourceListingId}/want`)
      .set('Cookie', buildAuthCookie(ownerId))
      .expect(403);
    expect(own.body).toEqual({
      error: 'Forbidden',
      message: 'books.errors.want_own',
    });
  });
});

describe('books API publication creation validation', () => {
  const buildOfferPayload = (overrides: Record<string, unknown> = {}) => ({
    type: 'offer',
    metadata: {
      title: 'Publicación manual',
      author: 'Autora manual',
      isbn: '0-306-40615-2',
    },
    images: [
      {
        id: 'cover-1',
        url: 'data:image/png;base64,aGVsbG8=',
        source: 'cover',
      },
    ],
    offer: {
      sale: false,
      donation: true,
      trade: false,
      condition: 'good',
      tradePreferences: [],
      availability: 'public',
      delivery: {
        nearBookCorner: true,
        inPerson: true,
        shipping: false,
      },
    },
    consents: { content: true, image: true, rules: true },
    ...overrides,
  });

  test('normalizes ISBN-10 and persists publication consents', async () => {
    const userId = await insertUser({ name: 'Publication owner' });

    const response = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(buildOfferPayload())
      .expect(201);

    const saved = await client.query(
      `SELECT b.isbn, p.content_consent, p.image_consent, p.rules_consent
       FROM book_listings p
       JOIN books b ON b.id = p.book_id
       WHERE p.id = $1`,
      [Number(response.body.id)]
    );
    expect(saved.rows[0]).toEqual({
      isbn: '0306406152',
      content_consent: true,
      image_consent: true,
      rules_consent: true,
    });
  });

  test('rejects invalid ISBN and image without persisting a listing', async () => {
    const userId = await insertUser({ name: 'Validation owner' });
    const before = await client.query(
      'SELECT COUNT(*)::int AS count FROM book_listings WHERE user_id = $1',
      [userId]
    );

    const invalidIsbn = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(
        buildOfferPayload({
          metadata: {
            title: 'ISBN inválido',
            author: 'Autora',
            isbn: '9780000000001',
          },
        })
      )
      .expect(400);
    expect(invalidIsbn.body).toEqual({
      error: 'InvalidFields',
      message: 'books.errors.invalid_isbn',
    });

    const invalidImage = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(
        buildOfferPayload({
          images: [
            { id: 'cover-1', url: 'javascript:alert(1)', source: 'cover' },
          ],
        })
      )
      .expect(400);
    expect(invalidImage.body).toEqual({
      error: 'InvalidFields',
      message: 'books.errors.invalid_image',
    });

    const after = await client.query(
      'SELECT COUNT(*)::int AS count FROM book_listings WHERE user_id = $1',
      [userId]
    );
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('requires publication consents before publishing', async () => {
    const userId = await insertUser({ name: 'Consent owner' });
    const response = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(
        buildOfferPayload({
          consents: { content: true, image: false, rules: true },
        })
      )
      .expect(400);

    expect(response.body).toEqual({
      error: 'MissingConsent',
      message: 'books.errors.consent_required',
    });
  });

  test('rejects unsafe editorial content before persisting a publication', async () => {
    const userId = await insertUser({ name: 'Editorial validation owner' });
    const response = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(
        buildOfferPayload({
          offer: {
            ...buildOfferPayload().offer,
            notes: '<script>alert(1)</script>',
          },
        })
      )
      .expect(422);

    expect(response.body).toEqual({
      error: 'EditorialRejected',
      message: 'books.errors.content_not_allowed',
    });

    const listings = await client.query(
      'SELECT COUNT(*)::int AS count FROM book_listings WHERE user_id = $1',
      [userId]
    );
    expect(listings.rows[0].count).toBe(0);
  });

  test('rejects an identical active offer from the same reader', async () => {
    const userId = await insertUser({ name: 'Duplicate offer owner' });
    const payload = buildOfferPayload();

    await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(payload)
      .expect(201);

    const duplicate = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(userId))
      .send(payload)
      .expect(409);

    expect(duplicate.body).toEqual({
      error: 'DuplicatePublication',
      message: 'books.errors.duplicate',
    });
  });

  test('keeps non-approved publications private and supports the admin correction flow', async () => {
    const ownerId = await insertUser({ name: 'Publication owner' });
    const adminId = await insertUser({ name: 'Editorial admin' });
    const created = await request(app)
      .post('/api/books')
      .set('Cookie', buildAuthCookie(ownerId))
      .send(buildOfferPayload())
      .expect(201);
    const listingId = Number(created.body.id);

    const forbidden = await request(app)
      .patch(`/api/books/${listingId}/editorial`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({
        status: 'needs_correction',
        reason: 'Falta completar la edición.',
      })
      .expect(403);
    expect(forbidden.body).toEqual({
      error: 'Forbidden',
      message: 'books.errors.editorial_admin_required',
    });

    await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [
      adminId,
    ]);

    const needsCorrection = await request(app)
      .patch(`/api/books/${listingId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({
        status: 'needs_correction',
        reason: 'Falta completar la edición.',
      })
      .expect(200);
    expect(needsCorrection.body).toMatchObject({
      id: String(listingId),
      editorialStatus: 'needs_correction',
      editorialReason: 'Falta completar la edición.',
    });

    await request(app)
      .get('/api/books')
      .expect(200)
      .then((response) => {
        expect(response.body).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: String(listingId) }),
          ])
        );
      });
    await request(app).get(`/api/books/${listingId}`).expect(404);

    const corrected = await request(app)
      .put(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ notes: 'Edición completada.' })
      .expect(200);
    expect(corrected.body).toMatchObject({
      editorialStatus: 'pending',
      editorialReason: null,
    });

    await request(app)
      .patch(`/api/books/${listingId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({ status: 'rejected' })
      .expect(422);

    await request(app)
      .patch(`/api/books/${listingId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({ status: 'approved' })
      .expect(200);

    const publicListings = await request(app).get('/api/books').expect(200);
    expect(publicListings.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: String(listingId) }),
      ])
    );
  });
});

describe('books API publication detail', () => {
  test('returns publication data for public listing', async () => {
    const userId = await insertUser({ name: 'Alice' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId, bookId });
    await insertImage(listingId, 'https://images.example.com/1.jpg', true);
    await insertImage(listingId, 'https://images.example.com/2.jpg', false);

    const res = await request(app).get(`/api/books/${listingId}`).expect(200);

    expect(res.body).toMatchObject({
      id: String(listingId),
      title: 'Libro test',
      author: 'Autor',
      condition: 'good',
      status: 'available',
      ownerId: String(userId),
      cornerId: 'corner-1',
      offer: {
        sale: true,
        donation: false,
        trade: true,
        price: { amount: 50, currency: 'ARS' },
        tradePreferences: ['intercambio'],
        availability: 'public',
        delivery: {
          nearBookCorner: true,
          inPerson: true,
          shipping: false,
        },
      },
    });
    expect(Array.isArray(res.body.images)).toBe(true);
    expect(res.body.images).toHaveLength(2);
    expect(typeof res.body.createdAt).toBe('string');
    expect(typeof res.body.updatedAt).toBe('string');
  });

  test('maps inactive legacy status to sold for owner detail', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({
      userId: ownerId,
      bookId,
      status: 'inactive',
      sale: true,
      trade: false,
    });

    const res = await request(app)
      .get(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .expect(200);

    expect(res.body.status).toBe('sold');
  });

  test('returns 404 for private listing when viewer is not owner', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({
      userId: ownerId,
      bookId,
      availability: 'private',
    });

    await request(app).get(`/api/books/${listingId}`).expect(404);
  });

  test('allows owner to fetch private listing with session cookie', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({
      userId: ownerId,
      bookId,
      availability: 'private',
    });
    await insertImage(
      listingId,
      'https://images.example.com/private.jpg',
      true
    );

    const res = await request(app)
      .get(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .expect(200);

    expect(res.body.id).toBe(String(listingId));
  });

  test('returns 404 for missing publication', async () => {
    await request(app).get('/api/books/9999').expect(404);
  });
});

describe('books API publication update', () => {
  test('updates publication for owner', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });
    await insertImage(listingId, 'https://images.example.com/old.jpg', true);

    const payload = {
      title: 'Libro actualizado',
      notes: 'Nuevas notas',
      status: 'reserved',
      images: [
        { url: 'https://images.example.com/new1.jpg', source: 'upload' },
        { url: 'https://images.example.com/new2.jpg', source: 'upload' },
      ],
      offer: {
        sale: true,
        donation: true,
        trade: false,
        price: { amount: 40, currency: 'ars' },
        tradePreferences: ['donaciones'],
        availability: 'public',
        delivery: { shipping: true, shippingPayer: 'owner' },
      },
    };

    const res = await request(app)
      .put(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send(payload)
      .expect(200);

    expect(res.body).toMatchObject({
      id: String(listingId),
      title: 'Libro actualizado',
      status: 'reserved',
      notes: 'Nuevas notas',
      offer: {
        sale: true,
        donation: true,
        trade: false,
        price: { amount: 40, currency: 'ARS' },
        tradePreferences: ['donaciones'],
        availability: 'public',
        delivery: { shipping: true, shippingPayer: 'owner' },
      },
    });
    expect(res.body.images).toHaveLength(2);

    const listingRow = await client.query(
      'SELECT status, donation, trade, price_amount, price_currency, description, delivery_shipping, delivery_shipping_payer FROM book_listings WHERE id = $1',
      [listingId]
    );
    expect(listingRow.rows[0]).toMatchObject({
      status: 'reserved',
      donation: true,
      trade: false,
      price_amount: '40.00',
      price_currency: 'ARS',
      description: 'Nuevas notas',
      delivery_shipping: true,
      delivery_shipping_payer: 'owner',
    });

    const images = await client.query(
      'SELECT url FROM book_listing_images WHERE book_listing_id = $1 ORDER BY id',
      [listingId]
    );
    expect(images.rows.map((row) => row.url)).toEqual([
      'https://images.example.com/new1.jpg',
      'https://images.example.com/new2.jpg',
    ]);
  });

  test('allows marking publication as sold', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });

    const res = await request(app)
      .put(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ status: 'sold' })
      .expect(200);

    expect(res.body).toMatchObject({
      status: 'sold',
    });

    const listingRow = await client.query(
      'SELECT status, is_draft FROM book_listings WHERE id = $1',
      [listingId]
    );

    expect(listingRow.rows[0]).toMatchObject({
      status: 'sold',
      is_draft: false,
    });
  });

  test('returns 404 when publication does not exist', async () => {
    const ownerId = await insertUser({ name: 'Owner' });

    await request(app)
      .put('/api/books/9999')
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ title: 'No existe' })
      .expect(404);
  });

  test('returns 403 when user is not owner', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const otherId = await insertUser({ name: 'Other' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });

    const res = await request(app)
      .put(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(otherId))
      .send({ title: 'Intento inválido' })
      .expect(403);

    expect(res.body).toEqual({
      error: 'Forbidden',
      message: 'books.errors.not_owner',
    });
  });

  test('returns 400 on invalid payload', async () => {
    const ownerId = await insertUser({ name: 'Owner' });
    const bookId = await insertBook();
    const listingId = await insertListing({ userId: ownerId, bookId });

    const res = await request(app)
      .put(`/api/books/${listingId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ status: 'invalid' })
      .expect(400);

    expect(res.body).toEqual({
      error: 'InvalidFields',
      message: 'books.errors.invalid_update',
    });
  });
});
