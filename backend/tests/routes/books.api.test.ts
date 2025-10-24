import request from 'supertest';
import {
  beforeEach,
  afterEach,
  describe,
  expect,
  test,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import * as openLibrary from '../../src/services/openLibrary.js';
import {
  createBookListing,
  type BookListingStatus,
} from '../../src/repositories/bookListingRepository.js';

let client: PoolClient;
let originalJwtSecret: string | undefined;

beforeAll(() => {
  originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'testsecret';
});

afterAll(() => {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
  vi.spyOn(openLibrary, 'checkBookExists').mockResolvedValue(false);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
  vi.restoreAllMocks();
});

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

describe('book listing statuses', () => {
  test('translates internal statuses for user listings and detail view', async () => {
    const { cookie, userId } = await registerAndLoginUser('owner@example.com');

    const soldId = await createListingForUser({
      userId,
      sale: true,
      trade: false,
      donation: false,
      status: 'inactive',
    });

    const exchangedId = await createListingForUser({
      userId,
      sale: false,
      trade: true,
      donation: false,
      status: 'inactive',
    });

    const completedId = await createListingForUser({
      userId,
      sale: false,
      trade: false,
      donation: true,
      status: 'inactive',
    });

    const availableId = await createListingForUser({
      userId,
      sale: false,
      trade: false,
      donation: true,
      status: 'available',
    });

    const mineRes = await request(app)
      .get('/api/books/mine')
      .set('Cookie', cookie)
      .expect(200);

    const mineListings = mineRes.body as Array<{
      id: string;
      status: string;
      bookListingStatus: string;
    }>;

    const soldListing = mineListings.find((item) => item.id === String(soldId));
    expect(soldListing?.status).toBe('sold');
    expect(soldListing?.bookListingStatus).toBe('inactive');

    const exchangedListing = mineListings.find(
      (item) => item.id === String(exchangedId)
    );
    expect(exchangedListing?.status).toBe('exchanged');

    const completedListing = mineListings.find(
      (item) => item.id === String(completedId)
    );
    expect(completedListing?.status).toBe('completed');

    const detailRes = await request(app)
      .get(`/api/books/${exchangedId}`)
      .expect(200);
    expect(detailRes.body.status).toBe('exchanged');
    expect(detailRes.body.bookListingStatus).toBe('inactive');

    const publicRes = await request(app).get('/api/books').expect(200);
    const publicListing = (
      publicRes.body as Array<{ id: string; status: string }>
    ).find((item) => item.id === String(availableId));
    expect(publicListing?.status).toBe('available');
  });
});

async function registerAndLoginUser(email: string) {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Owner',
      email,
      password: 'Str0ng!Pass1',
    })
    .expect(201);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Str0ng!Pass1' })
    .expect(200);

  const cookie = loginRes.headers['set-cookie'][0];
  const userId = Number(loginRes.body.user.id);
  return { cookie, userId };
}

async function createListingForUser({
  userId,
  sale,
  trade,
  donation,
  status,
}: {
  userId: number;
  sale: boolean;
  trade: boolean;
  donation: boolean;
  status: BookListingStatus;
}) {
  const listing = await createBookListing({
    userId,
    book: {
      title: 'Test Book',
      author: 'Author',
      isbn: null,
      publisher: null,
      publishedYear: null,
      language: null,
      format: null,
      coverUrl: null,
    },
    type: 'offer',
    condition: 'good',
    notes: null,
    sale,
    donation,
    trade,
    priceAmount: sale ? 10 : null,
    priceCurrency: sale ? 'USD' : null,
    tradePreferences: trade ? ['fantasy'] : [],
    availability: 'public',
    isDraft: false,
    cornerId: null,
    delivery: {
      nearBookCorner: false,
      inPerson: true,
      shipping: false,
      shippingPayer: null,
    },
    images: [],
  });

  if (status !== listing.status) {
    await client.query(
      'UPDATE book_listings SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, listing.id]
    );
  }

  return listing.id;
}
