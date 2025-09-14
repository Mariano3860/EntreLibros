import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';

let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
});

describe('books API', () => {
  test('creates, verifies and searches books via HTTP', async () => {
    const createRes = await request(app)
      .post('/api/books')
      .send({ title: 'API Book', author: 'Author' })
      .expect(201);
    expect(createRes.body.verified).toBe(false);

    let res = await request(app).get('/api/books').expect(200);
    expect(res.body).toHaveLength(0);

    await request(app)
      .post(`/api/books/${createRes.body.id}/verify`)
      .expect(200);

    res = await request(app).get('/api/books?q=API').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].verified).toBe(true);
  });

  test('returns i18n errors for missing fields and not found', async () => {
    const missing = await request(app).post('/api/books').send({}).expect(400);
    expect(missing.body).toEqual({
      error: 'MissingFields',
      message: 'books.errors.missing_title_author',
    });

    const notFound = await request(app)
      .post('/api/books/999/verify')
      .expect(404);
    expect(notFound.body).toEqual({
      error: 'BookNotFound',
      message: 'books.errors.not_found',
    });
  });
});
