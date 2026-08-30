import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';

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

async function registerAndLogin() {
  const email = `community-story-${Date.now()}-${Math.random()}@example.com`;
  const password = 'Str0ng!Pass1';
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Story reader', email, password })
    .expect(201);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return login.headers['set-cookie'][0] as string;
}

describe('community persistence endpoints', () => {
  test('returns database-backed stats without fixture data', async () => {
    const response = await request(app).get('/api/community/stats').expect(200);

    expect(response.body.kpis).toEqual({
      exchanges: expect.any(Number),
      activeHouses: expect.any(Number),
      activeUsers: expect.any(Number),
      booksPublished: expect.any(Number),
    });
    expect(response.body.hotSearches).toEqual([]);
    expect(response.body.activeHousesMap).toEqual(expect.any(Array));
  });

  test('returns a paginated public feed', async () => {
    const response = await request(app)
      .get('/api/community/feed')
      .query({ page: 0, size: 3 })
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
    expect(response.body.length).toBeLessThanOrEqual(3);
    for (const item of response.body) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          user: expect.any(String),
          type: expect.stringMatching(/^(book|sale|seeking|story)$/),
        })
      );
    }
  });

  test('persists a social story and returns it in the feed', async () => {
    const cookie = await registerAndLogin();
    const created = await request(app)
      .post('/api/community/stories')
      .set('Cookie', cookie)
      .send({ body: 'Una recomendación para la comunidad.' })
      .expect(201);

    expect(created.body).toEqual(
      expect.objectContaining({
        type: 'story',
        body: 'Una recomendación para la comunidad.',
      })
    );

    const feed = await request(app)
      .get('/api/community/feed')
      .query({ page: 0, size: 20 })
      .expect(200);
    expect(feed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.body.id,
          type: 'story',
        }),
      ])
    );
  });

  test('validates pagination input', async () => {
    const response = await request(app)
      .get('/api/community/feed')
      .query({ page: -1 })
      .expect(400);

    expect(response.body).toEqual({
      error: 'BadRequest',
      message: 'community.errors.invalid_pagination',
    });

    const invalidSize = await request(app)
      .get('/api/community/feed')
      .query({ size: 0 })
      .expect(400);

    expect(invalidSize.body).toEqual({
      error: 'BadRequest',
      message: 'community.errors.invalid_pagination',
    });
  });

  test('returns persistence-backed activity and suggestions', async () => {
    const [activity, suggestions] = await Promise.all([
      request(app).get('/api/community/activity').expect(200),
      request(app).get('/api/community/suggestions').expect(200),
    ]);

    expect(activity.body).toEqual(expect.any(Array));
    expect(suggestions.body).toEqual(expect.any(Array));
    for (const item of [...activity.body, ...suggestions.body]) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          user: expect.any(String),
          avatar: expect.any(String),
        })
      );
    }
  });
});
