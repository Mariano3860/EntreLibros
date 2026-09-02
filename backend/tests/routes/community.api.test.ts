import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import { findUserByEmail } from '../../src/repositories/userRepository.js';

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

async function registerUser(email: string, name: string) {
  const password = 'Str0ng!Pass1';
  await request(app)
    .post('/api/auth/register')
    .send({ name, email, password })
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

  test('persists unique likes and ordered comments for visible posts', async () => {
    const email = `community-social-${Date.now()}@example.com`;
    const cookie = await registerUser(email, 'Social reader');
    const user = await findUserByEmail(email);
    expect(user).not.toBeNull();

    const book = await client.query<{ id: number }>(
      `INSERT INTO books (title, author)
       VALUES ('Social engagement book', 'A. Reader')
       RETURNING id`
    );
    const listing = await client.query<{ id: number }>(
      `INSERT INTO book_listings (user_id, book_id, type, status, condition, trade)
       VALUES ($1, $2, 'offer', 'available', 'good', true)
       RETURNING id`,
      [user!.id, book.rows[0].id]
    );
    const story = await client.query<{ id: number }>(
      `INSERT INTO community_stories (user_id, body)
       VALUES ($1, 'Una historia para probar interacciones.')
       RETURNING id`,
      [user!.id]
    );

    await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/like`)
      .expect(401);
    await request(app)
      .post('/api/community/posts/listing/not-an-id/like')
      .set('Cookie', cookie)
      .expect(400, {
        error: 'BadRequest',
        message: 'community.social.invalid_post',
      });

    const blockedViewerEmail = `community-blocked-viewer-${Date.now()}@example.com`;
    const blockedViewerCookie = await registerUser(
      blockedViewerEmail,
      'Blocked viewer'
    );
    const blockedViewer = await findUserByEmail(blockedViewerEmail);
    await client.query(
      `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`,
      [blockedViewer!.id, user!.id]
    );
    await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/like`)
      .set('Cookie', blockedViewerCookie)
      .expect(404, {
        error: 'NotFound',
        message: 'community.social.post_not_found',
      });
    await request(app)
      .get(`/api/community/posts/listing/${listing.rows[0].id}/comments`)
      .set('Cookie', blockedViewerCookie)
      .expect(404, {
        error: 'NotFound',
        message: 'community.social.post_not_found',
      });

    await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/like`)
      .set('Cookie', cookie)
      .expect(200, { liked: true, likes: 1 });
    await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/like`)
      .set('Cookie', cookie)
      .expect(200, { liked: false, likes: 0 });
    await request(app)
      .post(`/api/community/posts/story/story-${story.rows[0].id}/like`)
      .set('Cookie', cookie)
      .expect(200, { liked: true, likes: 1 });

    await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/comments`)
      .set('Cookie', cookie)
      .send({ body: '   ' })
      .expect(422, {
        error: 'CommunityCommentError',
        message: 'community.social.comment_invalid',
      });
    const comment = await request(app)
      .post(`/api/community/posts/listing/${listing.rows[0].id}/comments`)
      .set('Cookie', cookie)
      .send({ body: 'Me interesa conocer esta edición.' })
      .expect(201);

    expect(comment.body).toEqual(
      expect.objectContaining({
        author: 'Social reader',
        body: 'Me interesa conocer esta edición.',
        createdAt: expect.any(String),
      })
    );

    await request(app)
      .get(`/api/community/posts/listing/${listing.rows[0].id}/comments`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          expect.objectContaining({
            id: comment.body.id,
            body: 'Me interesa conocer esta edición.',
          }),
        ]);
      });

    await request(app)
      .get('/api/community/feed')
      .set('Cookie', cookie)
      .query({ size: 20 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: String(listing.rows[0].id),
              likes: 0,
              commentsCount: 1,
              likedByMe: false,
            }),
            expect.objectContaining({
              id: `story-${story.rows[0].id}`,
              likes: 1,
              likedByMe: true,
            }),
          ])
        );
      });
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

  test('recommends relevant readers and books and persists follow actions', async () => {
    const viewerEmail = `community-viewer-${Date.now()}@example.com`;
    const targetEmail = `community-target-${Date.now()}@example.com`;
    const viewerCookie = await registerUser(viewerEmail, 'Community viewer');
    const targetCookie = await registerUser(targetEmail, 'Fiction friend');
    const viewer = await findUserByEmail(viewerEmail);
    const target = await findUserByEmail(targetEmail);
    expect(viewer).not.toBeNull();
    expect(target).not.toBeNull();

    for (const [cookie, city, neighborhood] of [
      [viewerCookie, 'Buenos Aires', 'Palermo'],
      [targetCookie, 'La Plata', 'Tolosa'],
    ] as const) {
      await request(app)
        .patch('/api/user/profile')
        .set('Cookie', cookie)
        .send({
          interests: ['fiction', 'poetry'],
          city,
          neighborhood,
          locationVisibility: 'neighborhood',
        })
        .expect(200);
    }

    const book = await client.query<{ id: number }>(
      `INSERT INTO books (title, author, cover_url)
       VALUES ('Fiction friend recommendation', 'A. Author', 'https://example.com/cover.jpg')
       RETURNING id`
    );
    const listing = await client.query<{ id: number }>(
      `INSERT INTO book_listings (user_id, book_id, type, status, condition, trade)
       VALUES ($1, $2, 'offer', 'available', 'good', true)
       RETURNING id`,
      [target!.id, book.rows[0].id]
    );
    await client.query(
      `INSERT INTO community_stories (user_id, body, book_listing_id)
       VALUES ($1, 'Una historia de prueba para lectores afines.', $2)`,
      [target!.id, listing.rows[0].id]
    );
    await client.query(
      `INSERT INTO community_stories (user_id, body)
       VALUES ($1, 'Esta historia propia no debe aparecer en la tira.')`,
      [viewer!.id]
    );

    await request(app)
      .get('/api/community/discovery')
      .set('Cookie', viewerCookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.stories).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: String(target!.id),
              user: 'Fiction friend',
            }),
          ])
        );
        expect(body.stories).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: String(viewer!.id) }),
          ])
        );
        expect(body.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: String(target!.id),
              reason: 'similar_interests',
              isFollowing: false,
            }),
          ])
        );
        expect(body.recommendedBooks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: String(listing.rows[0].id),
              owner: { id: String(target!.id), user: 'Fiction friend' },
            }),
          ])
        );
      });

    await request(app)
      .post(`/api/community/follows/${target!.id}`)
      .set('Cookie', viewerCookie)
      .expect(201, { following: true, userId: String(target!.id) });

    await request(app)
      .get('/api/community/discovery')
      .set('Cookie', viewerCookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: String(target!.id),
              isFollowing: true,
            }),
          ])
        );
      });

    await request(app)
      .delete(`/api/community/follows/${target!.id}`)
      .set('Cookie', viewerCookie)
      .expect(200, { following: false, userId: String(target!.id) });
  });

  test('protects discovery and rejects following yourself', async () => {
    await request(app).get('/api/community/discovery').expect(401);
    const cookie = await registerAndLogin();
    const user = await client.query<{ id: number }>(
      `SELECT id FROM users WHERE email LIKE 'community-story-%@example.com'
       ORDER BY id DESC LIMIT 1`
    );
    await request(app)
      .post(`/api/community/follows/${user.rows[0].id}`)
      .set('Cookie', cookie)
      .expect(422, {
        error: 'InvalidTarget',
        message: 'community.follow.errors.self',
      });
  });
});
