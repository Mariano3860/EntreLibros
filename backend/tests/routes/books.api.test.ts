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
  test('creates and lists books via HTTP', async () => {
    await request(app)
      .post('/api/books')
      .send({ title: 'API Book' })
      .expect(201);
    const res = await request(app).get('/api/books').expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('API Book');
  });
});
