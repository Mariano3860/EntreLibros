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
      $1, $2, $3, 'offer', $4, 'good', $5, $6, $7, $8, $9, $10, $11, $12,
      true, true, false, NULL, $13
    ) RETURNING id`,
    [
      userId,
      bookId,
      status,
      notes,
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
    const res = await request(app).post('/api/books/123/verify').expect(404);
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
      bookListingStatus: 'sold',
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
