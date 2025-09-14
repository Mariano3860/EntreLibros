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

describe('books API', () => {
  test('creates, lists and verifies books via HTTP', async () => {
    const createRes = await request(app)
      .post('/api/books')
      .send({ title: 'API Book' })
      .expect(201);
    expect(createRes.body.verified).toBe(false);

    const res = await request(app).get('/api/books').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('API Book');

    const verifyRes = await request(app)
      .post(`/api/books/${createRes.body.id}/verify`)
      .expect(200);
    expect(verifyRes.body.verified).toBe(true);
  });

  test('requires q for search', async () => {
    const res = await request(app).get('/api/books/search').expect(400);
    expect(res.body).toEqual({
      error: 'MissingFields',
      message: 'books.errors.q_required',
    });
  });

  test('requires title when creating book', async () => {
    const res = await request(app).post('/api/books').send({}).expect(400);
    expect(res.body).toEqual({
      error: 'MissingFields',
      message: 'books.errors.title_required',
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
