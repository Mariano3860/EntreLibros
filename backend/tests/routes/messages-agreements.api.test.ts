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

async function registerAndLogin(name: string) {
  const email = `${name}-${Date.now()}@example.com`;
  const password = 'Str0ng!Pass1';
  const register = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password })
    .expect(201);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return {
    id: register.body.user.id as number,
    cookie: login.headers['set-cookie'][0] as string,
  };
}

describe('messaging and agreements API', () => {
  test('returns localized validation and authorization errors', async () => {
    await request(app)
      .get('/api/messages')
      .expect(401)
      .expect(({ body }) => {
        expect(body.message).toBe('auth.errors.unauthorized');
      });

    const first = await registerAndLogin('validation-user');
    await request(app)
      .get('/api/messages/1/messages?limit=101')
      .set('Cookie', first.cookie)
      .expect(422)
      .expect(({ body }) => {
        expect(body.message).toBe('messaging.errors.invalid_pagination');
      });

    await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: 'not-a-number' })
      .expect(422)
      .expect(({ body }) => {
        expect(body.message).toBe('messaging.errors.participant_required');
      });
  });

  test('persists a private message, supports idempotent retry and history', async () => {
    const first = await registerAndLogin('message-a');
    const second = await registerAndLogin('message-b');
    const outsider = await registerAndLogin('message-outsider');

    const conversationResponse = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(201);
    const conversationId = conversationResponse.body.conversation.id as number;

    const payload = { clientKey: 'message-key-1', body: 'Hola' };
    const sent = await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send(payload)
      .expect(201);
    const retry = await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send(payload)
      .expect(201);
    expect(retry.body.message.id).toBe(sent.body.message.id);

    await request(app)
      .get(`/api/messages/${conversationId}/messages`)
      .set('Cookie', second.cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.messages).toHaveLength(1);
        expect(body.nextAfter).toBe(1);
      });

    await request(app)
      .get('/api/notifications')
      .set('Cookie', second.cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.notifications).toHaveLength(1);
        expect(body.notifications[0].kind).toBe('message');
        expect(body.notifications[0].data.conversationId).toBe(conversationId);
        expect(body.notifications[0].data.senderName).toBe('message-a');
      });
    await request(app)
      .patch(`/api/messages/${conversationId}/read`)
      .set('Cookie', second.cookie)
      .send({ sequence: 1 })
      .expect(204);
    await request(app)
      .get(`/api/messages/${conversationId}/messages`)
      .set('Cookie', outsider.cookie)
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );

    const attachedBook = await client.query<{ id: number }>(
      'INSERT INTO books (title) VALUES ($1) RETURNING id',
      ['Attached book']
    );
    const attachedListing = await client.query<{ id: number }>(
      `INSERT INTO book_listings (user_id, book_id, type, status)
       VALUES ($1, $2, 'offer', 'available') RETURNING id`,
      [first.id, attachedBook.rows[0].id]
    );
    const attached = await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send({
        clientKey: 'book-attachment-1',
        body: 'Te comparto este libro',
        attachmentMetadata: {
          key: `book:${attachedListing.rows[0].id}`,
          contentType: 'application/x-entrelibros-book',
          size: 1,
          kind: 'book',
          bookId: String(attachedListing.rows[0].id),
          title: 'Libro de prueba',
          author: 'Autora',
          coverUrl: '/cover.jpg',
        },
      })
      .expect(201);
    expect(attached.body.message.attachmentMetadata).toEqual(
      expect.objectContaining({
        kind: 'book',
        bookId: String(attachedListing.rows[0].id),
      })
    );

    await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', outsider.cookie)
      .send({
        clientKey: 'book-attachment-outsider',
        body: 'No debería pasar',
        attachmentMetadata: {
          key: `book:${attachedListing.rows[0].id}`,
          contentType: 'application/x-entrelibros-book',
          size: 1,
          kind: 'book',
          bookId: String(attachedListing.rows[0].id),
          title: 'Libro de prueba',
          author: 'Autora',
          coverUrl: '/cover.jpg',
        },
      })
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );
  });

  test('returns eligible books for each conversation participant', async () => {
    const first = await registerAndLogin('books-a');
    const second = await registerAndLogin('books-b');
    const outsider = await registerAndLogin('books-outsider');
    const conversation = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(201);
    const conversationId = conversation.body.conversation.id as number;
    const firstBook = await client.query<{ id: number }>(
      'INSERT INTO books (title) VALUES ($1) RETURNING id',
      ['First book']
    );
    const secondBook = await client.query<{ id: number }>(
      'INSERT INTO books (title) VALUES ($1) RETURNING id',
      ['Second book']
    );
    const reservedBook = await client.query<{ id: number }>(
      'INSERT INTO books (title) VALUES ($1) RETURNING id',
      ['Reserved book']
    );
    await client.query(
      `INSERT INTO book_listings (user_id, book_id, type, status)
       VALUES ($1, $2, 'offer', 'available'),
              ($3, $4, 'offer', 'available'),
              ($3, $5, 'offer', 'reserved')`,
      [
        first.id,
        firstBook.rows[0].id,
        second.id,
        secondBook.rows[0].id,
        reservedBook.rows[0].id,
      ]
    );
    const listings = await client.query<{ id: number; user_id: number }>(
      `SELECT id, user_id
       FROM book_listings
       WHERE book_id IN ($1, $2)
       ORDER BY id`,
      [firstBook.rows[0].id, secondBook.rows[0].id]
    );
    const firstListing = listings.rows.find((row) => row.user_id === first.id);
    const secondListing = listings.rows.find(
      (row) => row.user_id === second.id
    );
    expect(firstListing).toBeDefined();
    expect(secondListing).toBeDefined();

    await request(app)
      .get(`/api/messages/${conversationId}/books`)
      .set('Cookie', first.cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.myBooks).toEqual([
          expect.objectContaining({ title: 'First book' }),
        ]);
        expect(body.theirBooks).toEqual([
          expect.objectContaining({ title: 'Second book' }),
        ]);
      });

    await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send({
        clientKey: 'swap-attachment-1',
        body: 'Te propongo este intercambio',
        attachmentMetadata: {
          key: 'swap:1',
          contentType: 'application/x-entrelibros-swap',
          size: 1,
          kind: 'swap',
          offered: {
            id: String(firstListing?.id),
            title: 'First book',
            author: '',
            coverUrl: '',
            ownerId: first.id,
          },
          requested: {
            id: String(secondListing?.id),
            title: 'Second book',
            author: '',
            coverUrl: '',
            ownerId: second.id,
          },
        },
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.message.attachmentMetadata).toEqual(
          expect.objectContaining({
            kind: 'swap',
            offered: expect.objectContaining({
              id: String(firstListing?.id),
            }),
          })
        );
      });

    await request(app)
      .get(`/api/messages/${conversationId}/messages`)
      .set('Cookie', second.cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.messages).toHaveLength(1);
        expect(body.messages[0].attachmentMetadata.kind).toBe('swap');
      });

    await request(app)
      .get(`/api/messages/${conversationId}/books`)
      .set('Cookie', outsider.cookie)
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );
  });

  test('creates agreement history and returns a stale-version conflict', async () => {
    const first = await registerAndLogin('agreement-a');
    const second = await registerAndLogin('agreement-b');
    const conversation = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(201);
    const conversationId = conversation.body.conversation.id as number;

    const proposal = await request(app)
      .post('/api/agreements')
      .set('Cookie', first.cookie)
      .send({
        conversationId,
        participantId: second.id,
        details: {
          meetingPoint: 'Biblioteca',
          area: 'Centro',
          date: '2026-09-01',
          time: '18:00',
          bookTitle: 'Dune',
        },
      })
      .expect(201);
    const agreementId = proposal.body.agreement.id as number;

    await request(app)
      .post(`/api/agreements/${agreementId}/commands`)
      .set('Cookie', first.cookie)
      .send({ command: 'confirm', expectedVersion: 1 })
      .expect(200);
    await request(app)
      .get(`/api/messages/${conversationId}/messages`)
      .set('Cookie', second.cookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.messages).toHaveLength(2);
        expect(body.messages[0].attachmentMetadata).toEqual(
          expect.objectContaining({
            kind: 'agreement',
            agreementId,
            event: 'proposal',
          })
        );
        expect(body.messages[1].attachmentMetadata).toEqual(
          expect.objectContaining({
            kind: 'agreement',
            agreementId,
            event: 'confirm',
          })
        );
      });
    await request(app)
      .post(`/api/agreements/${agreementId}/commands`)
      .set('Cookie', second.cookie)
      .send({ command: 'confirm', expectedVersion: 1 })
      .expect(409)
      .expect(({ body }) => {
        expect(body.message).toBe('agreements.errors.conflict');
        expect(body.agreement.currentVersion).toBe(2);
      });
    await request(app)
      .get(`/api/agreements/${agreementId}/history`)
      .set('Cookie', second.cookie)
      .expect(200)
      .expect(({ body }) => expect(body.history).toHaveLength(2));
  });

  test('rejects non-members and unavailable listings with localized errors', async () => {
    const first = await registerAndLogin('listing-a');
    const second = await registerAndLogin('listing-b');
    const outsider = await registerAndLogin('listing-outsider');
    const conversation = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(201);
    const conversationId = conversation.body.conversation.id as number;
    const book = await client.query<{ id: number }>(
      'INSERT INTO books (title) VALUES ($1) RETURNING id',
      ['Unavailable']
    );
    const listing = await client.query<{ id: number }>(
      `INSERT INTO book_listings (user_id, book_id, type, status)
       VALUES ($1, $2, 'offer', 'reserved') RETURNING id`,
      [first.id, book.rows[0].id]
    );

    await request(app)
      .post('/api/agreements')
      .set('Cookie', first.cookie)
      .send({
        conversationId,
        participantId: outsider.id,
        details: {
          meetingPoint: 'Biblioteca',
          area: 'Centro',
          date: '2026-09-01',
          time: '18:00',
          bookTitle: 'Unavailable',
        },
      })
      .expect(422)
      .expect(({ body }) =>
        expect(body.message).toBe('agreements.errors.participants_invalid')
      );

    await request(app)
      .post('/api/agreements')
      .set('Cookie', first.cookie)
      .send({
        conversationId,
        participantId: second.id,
        listingIds: [listing.rows[0].id],
        details: {
          meetingPoint: 'Biblioteca',
          area: 'Centro',
          date: '2026-09-01',
          time: '18:00',
          bookTitle: 'Unavailable',
        },
      })
      .expect(422)
      .expect(({ body }) =>
        expect(body.message).toBe('agreements.errors.listing_unavailable')
      );

    await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send({
        clientKey: 'reserved-book-attachment',
        body: 'No debería pasar',
        attachmentMetadata: {
          key: `book:${listing.rows[0].id}`,
          contentType: 'application/x-entrelibros-book',
          size: 1,
          kind: 'book',
          bookId: String(listing.rows[0].id),
          title: 'Unavailable',
          author: '',
          coverUrl: '',
        },
      })
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );
  });

  test('rejects new conversations and agreements for blocked participants', async () => {
    const first = await registerAndLogin('blocked-a');
    const second = await registerAndLogin('blocked-b');
    await client.query(
      'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)',
      [first.id, second.id]
    );

    await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(403)
      .expect(({ body }) =>
        expect(body.message).toBe('messaging.errors.forbidden')
      );
  });
});
