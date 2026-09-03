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

describe('user activity API', () => {
  test('requires authentication', async () => {
    await request(app).get('/api/user/activity').expect(401);
  });

  test('returns the authenticated user’s persisted listings', async () => {
    const cookie = await (async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Activity User',
          email: 'activity@example.com',
          password: 'Str0ng!Pass1',
        })
        .expect(201);
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'activity@example.com', password: 'Str0ng!Pass1' })
        .expect(200);
      return login.headers['set-cookie'][0] as string;
    })();
    const user = await findUserByEmail('activity@example.com');
    expect(user).not.toBeNull();
    const books = await client.query<{ id: number; title: string }>(
      `INSERT INTO books (title) VALUES ('Activity one'), ('Activity two')
       RETURNING id, title`
    );
    await client.query(
      `INSERT INTO book_listings (user_id, book_id, type, status)
       VALUES ($1, $2, 'offer', 'available'), ($1, $3, 'offer', 'available')`,
      [user!.id, books.rows[0].id, books.rows[1].id]
    );

    await request(app)
      .get('/api/user/activity')
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(2);
        expect(body.map((item: { action: string }) => item.action)).toEqual([
          'offered',
          'offered',
        ]);
        expect(
          body.map((item: { bookTitle: string }) => item.bookTitle)
        ).toEqual(expect.arrayContaining(['Activity one', 'Activity two']));
      });
  });
});

describe('user profile API', () => {
  async function createLoggedInUser(email: string) {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Profile User', email, password: 'Str0ng!Pass1' })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Str0ng!Pass1' })
      .expect(200);
    return loginRes.headers['set-cookie'][0];
  }

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

  test('persists interests and a valid city-neighborhood pair', async () => {
    const cookie = await createLoggedInUser('profile-location@example.com');

    const update = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({
        interests: ['fiction', 'history', 'poetry'],
        city: 'Buenos Aires',
        neighborhood: 'Palermo',
        locationVisibility: 'neighborhood',
      })
      .expect(200);

    expect(update.body.interests).toEqual(['fiction', 'history', 'poetry']);
    expect(update.body.city).toBe('Buenos Aires');
    expect(update.body.neighborhood).toBe('Palermo');

    const profile = await request(app)
      .get('/api/user/profile')
      .set('Cookie', cookie)
      .expect(200);
    expect(profile.body).toMatchObject({
      interests: ['fiction', 'history', 'poetry'],
      city: 'Buenos Aires',
      neighborhood: 'Palermo',
    });
  });

  test('persists a validated profile photo and keeps street private', async () => {
    const cookie = await createLoggedInUser('profile-photo@example.com');
    const user = await findUserByEmail('profile-photo@example.com');
    expect(user).not.toBeNull();
    const photo = 'data:image/png;base64,aGVsbG8=';

    const update = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({
        profilePhoto: photo,
        country: 'Argentina',
        city: 'Buenos Aires',
        neighborhood: 'Palermo',
        street: 'Av. Santa Fe 1234',
        locationVisibility: 'city',
      })
      .expect(200);

    expect(update.body.profilePhoto).toBe(photo);
    expect(update.body.street).toBe('Av. Santa Fe 1234');

    const ownProfile = await request(app)
      .get('/api/user/profile')
      .set('Cookie', cookie)
      .expect(200);
    expect(ownProfile.body.street).toBe('Av. Santa Fe 1234');

    const publicProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(publicProfile.body.profilePhoto).toBe(photo);
    expect(publicProfile.body.country).toBe('Argentina');
    expect(publicProfile.body.city).toBe('Buenos Aires');
    expect(publicProfile.body.neighborhood).toBeUndefined();
    expect(publicProfile.body.street).toBeUndefined();

    await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({ profilePhoto: 'data:image/svg+xml;base64,PHN2Zz4=' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('user.errors.invalid_profile');
      });
  });

  test('rejects unknown interests and neighborhoods from another city', async () => {
    const cookie = await createLoggedInUser(
      'invalid-profile-location@example.com'
    );

    await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({ interests: ['free-text'] })
      .expect(400);

    await request(app)
      .patch('/api/user/profile')
      .set('Cookie', cookie)
      .send({ city: 'La Plata', neighborhood: 'Palermo' })
      .expect(400);
  });

  test('sanitizes public location at private, city and neighborhood levels', async () => {
    const cookie = await createLoggedInUser(
      'public-profile-location@example.com'
    );
    const user = await findUserByEmail('public-profile-location@example.com');
    expect(user).not.toBeNull();

    const update = async (locationVisibility: string) =>
      request(app)
        .patch('/api/user/profile')
        .set('Cookie', cookie)
        .send({
          city: 'Buenos Aires',
          neighborhood: 'Palermo',
          country: 'Argentina',
          street: 'Av. Santa Fe 1234',
          interests: [],
          locationVisibility,
        })
        .expect(200);

    await update('none');
    const privateProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(privateProfile.body.location).toBeNull();
    expect(privateProfile.body.country).toBeUndefined();
    expect(privateProfile.body.city).toBeUndefined();
    expect(privateProfile.body.neighborhood).toBeUndefined();
    expect(privateProfile.body.street).toBeUndefined();

    await update('country');
    const countryProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(countryProfile.body.country).toBe('Argentina');
    expect(countryProfile.body.city).toBeUndefined();
    expect(countryProfile.body.neighborhood).toBeUndefined();
    expect(countryProfile.body.street).toBeUndefined();

    await update('city');
    const cityProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(cityProfile.body.country).toBe('Argentina');
    expect(cityProfile.body.city).toBe('Buenos Aires');
    expect(cityProfile.body.neighborhood).toBeUndefined();
    expect(cityProfile.body.street).toBeUndefined();

    await update('neighborhood');
    const neighborhoodProfile = await request(app)
      .get(`/api/user/profile/${user!.id}`)
      .expect(200);
    expect(neighborhoodProfile.body.country).toBe('Argentina');
    expect(neighborhoodProfile.body.city).toBe('Buenos Aires');
    expect(neighborhoodProfile.body.neighborhood).toBe('Palermo');
    expect(neighborhoodProfile.body.street).toBeUndefined();
    expect(neighborhoodProfile.body.email).toBeUndefined();
    expect(neighborhoodProfile.body.password).toBeUndefined();
  });
});

describe('global person search API', () => {
  async function createLoggedInUser(email: string) {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Search Viewer', email, password: 'Str0ng!Pass1' })
      .expect(201);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Str0ng!Pass1' })
      .expect(200);
    return loginRes.headers['set-cookie'][0] as string;
  }

  async function insertUser(input: {
    name: string;
    email: string;
    alias?: string;
    role?: string;
    profileVisibility?: 'public' | 'private';
    profilePhoto?: string | null;
  }) {
    const result = await client.query<{ id: number }>(
      `INSERT INTO users (
         name, alias, email, password, role, profile_visibility, profile_photo_url
       ) VALUES ($1, $2, $3, 'hash', $4, $5, $6)
       RETURNING id`,
      [
        input.name,
        input.alias ?? input.name,
        input.email,
        input.role ?? 'user',
        input.profileVisibility ?? 'public',
        input.profilePhoto ?? null,
      ]
    );
    return result.rows[0].id;
  }

  test('requires authentication and returns an empty result for no query', async () => {
    await request(app).get('/api/user/search').expect(401);

    const cookie = await createLoggedInUser('search-empty@example.com');
    await request(app)
      .get('/api/user/search?q=')
      .set('Cookie', cookie)
      .expect(200)
      .expect([]);
  });

  test('searches by normalized text, exact id and email while applying privacy filters', async () => {
    const cookie = await createLoggedInUser('search-viewer@example.com');
    const viewer = await findUserByEmail('search-viewer@example.com');
    expect(viewer).not.toBeNull();

    const targetId = await insertUser({
      name: 'José Lector',
      alias: 'Lector Curioso',
      email: 'jose.lector@example.com',
      profilePhoto: 'https://cdn.example.com/jose.jpg',
    });
    const privateId = await insertUser({
      name: 'José Privado',
      email: 'jose.private@example.com',
      profileVisibility: 'private',
    });
    const botId = await insertUser({
      name: 'José Bot',
      email: 'jose.bot@example.com',
      role: 'bot',
    });
    const blockedByViewerId = await insertUser({
      name: 'José Bloqueado',
      email: 'jose.blocked@example.com',
    });
    const blockingViewerId = await insertUser({
      name: 'José Bloqueante',
      email: 'jose.blocking@example.com',
    });
    await client.query(
      'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2), ($3, $4)',
      [viewer!.id, blockedByViewerId, blockingViewerId, viewer!.id]
    );
    await client.query(
      'INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2)',
      [viewer!.id, targetId]
    );

    const book = await client.query<{ id: number }>(
      "INSERT INTO books (title) VALUES ('Search count book') RETURNING id"
    );
    await client.query(
      `INSERT INTO book_listings (user_id, book_id, type, availability, is_draft)
       VALUES ($1, $2, 'offer', 'public', false),
              ($1, $2, 'offer', 'public', true),
              ($1, $2, 'offer', 'private', false)`,
      [targetId, book.rows[0].id]
    );
    const conversation = await client.query<{ id: number }>(
      'INSERT INTO conversations DEFAULT VALUES RETURNING id'
    );
    await client.query(
      `INSERT INTO exchange_agreements
         (conversation_id, proposer_id, participant_id, state)
       VALUES ($1, $2, $3, 'completed')`,
      [conversation.rows[0].id, targetId, viewer!.id]
    );

    const response = await request(app)
      .get('/api/user/search')
      .query({ q: 'jose' })
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toEqual([
      {
        id: targetId,
        name: 'José Lector',
        alias: 'Lector Curioso',
        profilePhoto: 'https://cdn.example.com/jose.jpg',
        booksCount: 1,
        exchangeCount: 1,
        isFollowing: true,
      },
    ]);
    expect(response.body[0].email).toBeUndefined();
    expect(response.body[0].password).toBeUndefined();
    expect(response.body[0].location).toBeUndefined();

    await request(app)
      .get('/api/user/search')
      .query({ q: String(targetId) })
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => expect(body[0].id).toBe(targetId));
    await request(app)
      .get('/api/user/search')
      .query({ q: ' JOSE.LECTOR@EXAMPLE.COM ' })
      .set('Cookie', cookie)
      .expect(200)
      .expect(({ body }) => expect(body[0].id).toBe(targetId));
    expect(privateId).not.toBe(targetId);
    expect(botId).not.toBe(targetId);
  });

  test('rejects invalid long queries and caps deterministic results', async () => {
    const cookie = await createLoggedInUser('search-limit@example.com');
    const names = Array.from(
      { length: 21 },
      (_, index) => `Reader ${index + 1}`
    );
    for (const [index, name] of names.entries()) {
      await insertUser({
        name,
        email: `reader-${index + 1}@example.com`,
      });
    }

    await request(app)
      .get('/api/user/search')
      .query({ q: 'x'.repeat(81) })
      .set('Cookie', cookie)
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('user.errors.invalid_search');
      });

    const response = await request(app)
      .get('/api/user/search')
      .query({ q: 'reader' })
      .set('Cookie', cookie)
      .expect(200);
    expect(response.body).toHaveLength(20);
    expect(
      response.body.map((person: { name: string }) => person.name)
    ).toEqual(
      [...names].sort((left, right) => left.localeCompare(right)).slice(0, 20)
    );
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
