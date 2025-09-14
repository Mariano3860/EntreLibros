import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import { DEFAULT_USER_LANGUAGE } from '../../src/constants.js';

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
  test('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    expect(res.body.message).toBe('auth.success.register');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.language).toBe(DEFAULT_USER_LANGUAGE);
    expect(res.headers['set-cookie'][0]).toMatch(/sessionToken=/);
    expect(res.body.token).toBeUndefined();
  });

  test('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(409);
    expect(res.body.error).toBe('EmailExists');
  });

  test('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Eve', email: 'not-an-email', password: 'Str0ng!Pass1' })
      .expect(400);
    expect(res.body.error).toBe('InvalidEmail');
  });

  test('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Mallory',
        email: 'mallory@example.com',
        password: 'Weakpass1',
      })
      .expect(400);
    expect(res.body.error).toBe('WeakPassword');
  });

  test('fails when JWT secret is missing', async () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Zed',
        email: 'zed@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(500);
    expect(res.body.message).toBe('auth.errors.jwt_not_configured');
    process.env.JWT_SECRET = original;
  });

  test('logs in an existing user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    expect(res.body.message).toBe('auth.success.login');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.language).toBe(DEFAULT_USER_LANGUAGE);
    expect(res.headers['set-cookie'][0]).toMatch(/sessionToken=/);
    expect(res.body.token).toBeUndefined();
  });

  test('returns current user with valid session', async () => {
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
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(meRes.body.email).toBe('alice@example.com');
    expect(meRes.body.language).toBe(DEFAULT_USER_LANGUAGE);
  });

  test('logs out the current user', async () => {
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
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200);
    expect(logoutRes.body.message).toBe('auth.success.logout');
    const clearedCookie = logoutRes.headers['set-cookie'][0];
    expect(clearedCookie).toMatch(/sessionToken=;/);
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', clearedCookie.split(';')[0])
      .expect(401);
  });

  test('rejects unauthenticated me request', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  test('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'bad' })
      .expect(401);
    expect(res.body.error).toBe('InvalidCredentials');
  });

  test('rejects invalid email format on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'whatever' })
      .expect(400);
    expect(res.body.error).toBe('InvalidEmail');
  });

  test('requires email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nope@example.com' })
      .expect(400);
    expect(res.body.error).toBe('MissingFields');
  });
});
