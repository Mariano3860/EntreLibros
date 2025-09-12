import request from 'supertest';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import app from '../app.js';
import { pool, setTestClient } from '../db.js';
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

describe('auth API', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Secret123',
      })
      .expect(201);
    expect(res.body.message).toBe('auth.success.register');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'Secret123',
      })
      .expect(201);
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'Secret123',
      })
      .expect(409);
    expect(res.body.error).toBe('EmailExists');
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Eve', email: 'not-an-email', password: 'Secret123' })
      .expect(400);
    expect(res.body.error).toBe('InvalidEmail');
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Mallory',
        email: 'mallory@example.com',
        password: 'short',
      })
      .expect(400);
    expect(res.body.error).toBe('WeakPassword');
  });
});
