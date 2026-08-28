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
      .get(`/api/messages/${conversationId}/messages`)
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
});
