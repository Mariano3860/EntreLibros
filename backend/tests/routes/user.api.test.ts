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

describe('user language API', () => {
  test('updates language for authenticated user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    const res = await request(app)
      .post('/api/user/language')
      .set('Cookie', cookie)
      .send({ language: 'en' })
      .expect(200);
    expect(res.body.language).toBe('en');
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(meRes.body.language).toBe('en');
  });

  test('requires authentication', async () => {
    await request(app)
      .post('/api/user/language')
      .send({ language: 'en' })
      .expect(401);
  });

  test('requires language field', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    await request(app)
      .post('/api/user/language')
      .set('Cookie', cookie)
      .send({})
      .expect(400);
  });
});
