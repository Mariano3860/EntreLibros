import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import {
  findUserByEmail,
  updateUserLocation,
} from '../../src/repositories/userRepository.js';

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

describe('user profile API', () => {
  test('updates an authenticated profile and hides private fields publicly', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Legacy',
        email: 'profile@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    const user = await findUserByEmail('profile@example.com');
    expect(user).not.toBeNull();
    await updateUserLocation(user!.id, -58.3816, -34.6037, 10);

    const update = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({
        alias: 'Alice Lectora',
        description: 'Intercambio libros de ficción.',
        profileVisibility: 'public',
        locationVisibility: 'city',
      })
      .expect(200);
    expect(update.body.alias).toBe('Alice Lectora');
    expect(update.body.profileDescription).toBe(
      'Intercambio libros de ficción.'
    );

    const publicProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(publicProfile.body).toMatchObject({
      id: user!.id,
      alias: 'Alice Lectora',
      profileDescription: 'Intercambio libros de ficción.',
      location: { latitude: -34.6, longitude: -58.38 },
    });
    expect(publicProfile.body.email).toBeUndefined();
    expect(publicProfile.body.password).toBeUndefined();
  });

  test('does not expose a private profile', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Private User',
        email: 'private-profile@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'private-profile@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    const user = await findUserByEmail('private-profile@example.com');
    await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({ profileVisibility: 'private' })
      .expect(200);

    await request(app).get(`/api/user/profile/${user!.id}`).expect(404);
  });
});

describe('user block API', () => {
  test('blocks and unblocks another user without exposing the relationship', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Blocker',
        email: 'blocker@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Blocked',
        email: 'blocked@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'blocker@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    const blocker = await findUserByEmail('blocker@example.com');
    const blocked = await findUserByEmail('blocked@example.com');
    expect(blocker).not.toBeNull();
    expect(blocked).not.toBeNull();

    await request(app)
      .get(`/api/user/blocks/${blocked!.id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ blocked: false }));

    await request(app)
      .put(`/api/user/blocks/${blocked!.id}`)
      .set('Cookie', cookie)
      .expect(204);
    await request(app)
      .get(`/api/user/blocks/${blocked!.id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ blocked: true }));

    await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', cookie)
      .send({ participantId: blocked!.id })
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );

    await request(app)
      .delete(`/api/user/blocks/${blocked!.id}`)
      .set('Cookie', cookie)
      .expect(204);
    await request(app)
      .get(`/api/user/blocks/${blocked!.id}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ blocked: false }));
  });

  test('does not allow blocking oneself or a missing user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Solo',
        email: 'solo@example.com',
        password: 'Str0ng!Pass1',
      })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'solo@example.com', password: 'Str0ng!Pass1' })
      .expect(200);
    const cookie = loginRes.headers['set-cookie'][0];
    const user = await findUserByEmail('solo@example.com');

    await request(app)
      .put(`/api/user/blocks/${user!.id}`)
      .set('Cookie', cookie)
      .expect(404)
      .expect(({ body }) =>
        expect(body.message).toBe('user.errors.block_target_not_found')
      );
    await request(app)
      .put('/api/user/blocks/999999')
      .set('Cookie', cookie)
      .expect(404);
  });
});
