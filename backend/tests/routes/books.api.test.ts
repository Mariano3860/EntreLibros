import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import * as openLibrary from '../../src/services/openLibrary.js';

let client: PoolClient;

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

async function registerAndLogin(email: string) {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: email.split('@')[0] ?? 'User',
      email,
      password: 'Str0ng!Pass1',
    })
    .expect(201);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Str0ng!Pass1' })
    .expect(200);
  return loginRes.headers['set-cookie'][0];
}

function buildPayload(overrides?: Partial<Record<string, unknown>>) {
  const base = {
    metadata: {
      title: 'Publicación de prueba',
      author: 'Autor/a',
      publisher: 'Editorial',
      year: 2020,
      isbn: '9780000000000',
      coverUrl: 'https://example.com/cover.jpg',
    },
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/cover.jpg',
        source: 'cover',
      },
    ],
    offer: {
      sale: true,
      donation: false,
      trade: true,
      price: { amount: 1500, currency: 'ars' },
      condition: 'good',
      tradePreferences: ['Dune'],
      notes: 'Estado impecable',
      availability: 'public',
      delivery: {
        nearBookCorner: true,
        inPerson: true,
        shipping: true,
        shippingPayer: 'owner',
      },
    },
    draft: false,
    type: 'offer',
  };
  if (!overrides) {
    return base;
  }
  return {
    ...base,
    ...overrides,
    metadata: {
      ...base.metadata,
      ...(overrides.metadata as object | undefined),
    },
    offer: { ...base.offer, ...(overrides.offer as object | undefined) },
    images: overrides.images ?? base.images,
  };
}

describe('books API publications', () => {
  test('creates a publication and returns user entry', async () => {
    const cookie = await registerAndLogin('alice@example.com');
    const payload = buildPayload();

    const res = await request(app)
      .post('/api/books')
      .set('Cookie', cookie)
      .send(payload)
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'Publicación de prueba',
      author: 'Autor/a',
      isForSale: true,
      isForTrade: true,
      isForDonation: false,
      price: 1500,
      priceCurrency: 'ARS',
      availability: 'public',
      publicationStatus: 'available',
      draft: false,
      type: 'offer',
      notes: 'Estado impecable',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.coverUrl).toBe('https://example.com/cover.jpg');
    expect(res.body.delivery).toEqual({
      nearBookCorner: true,
      inPerson: true,
      shipping: true,
      shippingPayer: 'owner',
    });
    expect(res.body.tradePreferences).toEqual(['Dune']);
    expect(res.body.publisher).toBe('Editorial');
    expect(res.body.year).toBe(2020);
    expect(res.body.isSeeking).toBe(false);
  });

  test('lists publications belonging to the authenticated user', async () => {
    const aliceCookie = await registerAndLogin('alice@example.com');
    const bobCookie = await registerAndLogin('bob@example.com');

    await request(app)
      .post('/api/books')
      .set('Cookie', aliceCookie)
      .send(buildPayload({ metadata: { title: 'Libro A' } }))
      .expect(201);

    await request(app)
      .post('/api/books')
      .set('Cookie', aliceCookie)
      .send(
        buildPayload({ metadata: { title: 'Libro B' }, offer: { sale: false } })
      )
      .expect(201);

    await request(app)
      .post('/api/books')
      .set('Cookie', bobCookie)
      .send(buildPayload({ metadata: { title: 'Libro Bob' } }))
      .expect(201);

    const res = await request(app)
      .get('/api/books/mine')
      .set('Cookie', aliceCookie)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((item: { title: string }) => item.title).sort();
    expect(titles).toEqual(['Libro A', 'Libro B']);
  });

  test('lists only public, available publications', async () => {
    const cookie = await registerAndLogin('carol@example.com');

    await request(app)
      .post('/api/books')
      .set('Cookie', cookie)
      .send(buildPayload({ metadata: { title: 'Público' } }))
      .expect(201);

    await request(app)
      .post('/api/books')
      .set('Cookie', cookie)
      .send(
        buildPayload({
          metadata: { title: 'Privado' },
          offer: { availability: 'private' },
        })
      )
      .expect(201);

    await request(app)
      .post('/api/books')
      .set('Cookie', cookie)
      .send(
        buildPayload({
          metadata: { title: 'Borrador' },
          draft: true,
        })
      )
      .expect(201);

    await client.query(
      "UPDATE publications SET status = 'reserved' WHERE description = 'Estado impecable' AND availability = 'private'"
    );

    const res = await request(app).get('/api/books').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Público');
    expect(res.body[0].isForSale).toBe(true);
    expect(res.body[0].publicationStatus).toBe('available');
  });

  test('rejects payloads without metadata title', async () => {
    const cookie = await registerAndLogin('dave@example.com');
    const payload = buildPayload({ metadata: { title: '' } });

    const res = await request(app)
      .post('/api/books')
      .set('Cookie', cookie)
      .send(payload)
      .expect(400);

    expect(res.body).toEqual({
      error: 'MissingFields',
      message: 'books.errors.metadata_title_required',
    });
  });

  test('requires authentication for creation and personal listing', async () => {
    await request(app).post('/api/books').send(buildPayload()).expect(401);
    await request(app).get('/api/books/mine').expect(401);
  });
});

describe('books API legacy endpoints', () => {
  test('requires q for search', async () => {
    const res = await request(app).get('/api/books/search').expect(400);
    expect(res.body).toEqual({
      error: 'MissingFields',
      message: 'books.errors.q_required',
    });
  });

  test('returns search error when OpenLibrary fails', async () => {
    vi.spyOn(openLibrary, 'searchBooks').mockRejectedValueOnce(
      new Error('fail')
    );
    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'foo' })
      .expect(502);
    expect(res.body).toEqual({
      error: 'SearchFailed',
      message: 'books.errors.search_failed',
    });
  });

  test('returns not found when verifying missing book', async () => {
    const res = await request(app).post('/api/books/123/verify').expect(404);
    expect(res.body).toEqual({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  });
});
