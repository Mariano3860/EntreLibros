import request from 'supertest';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';

let client: PoolClient;

beforeAll(() => {
  process.env.JWT_SECRET = 'e2e-test-secret';
});

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
  const registered = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password })
    .expect(201);
  const loggedIn = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return {
    id: registered.body.user.id as number,
    cookie: loggedIn.headers['set-cookie'][0] as string,
  };
}

const agreementDetails = {
  meetingPoint: 'Biblioteca',
  area: 'Centro',
  date: '2026-09-01',
  time: '18:00',
  bookTitle: 'Dune',
};

describe('messaging and agreement real-service E2E', () => {
  test('runs messaging persistence, negotiation, conflict and cursor flow', async () => {
    const first = await registerAndLogin('e2e-first');
    const second = await registerAndLogin('e2e-second');
    const third = await registerAndLogin('e2e-third');

    const conversation = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: second.id })
      .expect(201);
    const conversationId = conversation.body.conversation.id as number;

    await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', first.cookie)
      .send({ clientKey: 'e2e-message-1', body: 'Primer mensaje' })
      .expect(201);
    await request(app)
      .post(`/api/messages/${conversationId}/messages`)
      .set('Cookie', second.cookie)
      .send({ clientKey: 'e2e-message-2', body: 'Segundo mensaje' })
      .expect(201);
    const missed = await request(app)
      .get(`/api/messages/${conversationId}/messages?after=1`)
      .set('Cookie', second.cookie)
      .expect(200);
    expect(
      missed.body.messages.map(
        (message: { sequence: number }) => message.sequence
      )
    ).toEqual([2]);

    const proposal = await request(app)
      .post('/api/agreements')
      .set('Cookie', first.cookie)
      .send({
        conversationId,
        participantId: second.id,
        details: agreementDetails,
      })
      .expect(201);
    const agreementId = proposal.body.agreement.id as number;

    const counterproposal = await request(app)
      .post(`/api/agreements/${agreementId}/versions`)
      .set('Cookie', second.cookie)
      .send({
        expectedVersion: 1,
        details: { ...agreementDetails, time: '19:00' },
      })
      .expect(201);
    expect(counterproposal.body.agreement.currentVersion).toBe(2);

    await request(app)
      .post(`/api/agreements/${agreementId}/commands`)
      .set('Cookie', first.cookie)
      .send({ command: 'confirm', expectedVersion: 1 })
      .expect(409);
    await request(app)
      .post(`/api/agreements/${agreementId}/commands`)
      .set('Cookie', first.cookie)
      .send({ command: 'confirm', expectedVersion: 2 })
      .expect(200);
    const cancelled = await request(app)
      .post(`/api/agreements/${agreementId}/commands`)
      .set('Cookie', second.cookie)
      .send({
        command: 'cancel',
        expectedVersion: 3,
        reason: 'Necesitamos coordinar otra fecha.',
      })
      .expect(200);
    expect(cancelled.body.agreement.state).toBe('cancelled');

    const finalConversation = await request(app)
      .post('/api/messages/conversations')
      .set('Cookie', first.cookie)
      .send({ participantId: third.id })
      .expect(201);
    const finalConversationId = finalConversation.body.conversation
      .id as number;
    const finalProposal = await request(app)
      .post('/api/agreements')
      .set('Cookie', first.cookie)
      .send({
        conversationId: finalConversationId,
        participantId: third.id,
        details: agreementDetails,
      })
      .expect(201);
    const finalAgreementId = finalProposal.body.agreement.id as number;
    await request(app)
      .post(`/api/agreements/${finalAgreementId}/commands`)
      .set('Cookie', first.cookie)
      .send({ command: 'confirm', expectedVersion: 1 })
      .expect(403);
    const partial = await request(app)
      .post(`/api/agreements/${finalAgreementId}/commands`)
      .set('Cookie', third.cookie)
      .send({ command: 'confirm', expectedVersion: 1 })
      .expect(200);
    expect(partial.body.agreement.state).toBe('partially_confirmed');
    const confirmed = await request(app)
      .post(`/api/agreements/${finalAgreementId}/commands`)
      .set('Cookie', first.cookie)
      .send({ command: 'confirm', expectedVersion: 2 })
      .expect(200);
    expect(confirmed.body.agreement.state).toBe('confirmed');

    const history = await request(app)
      .get(`/api/agreements/${finalAgreementId}/history`)
      .set('Cookie', first.cookie)
      .expect(200);
    expect(
      history.body.history.map((entry: { version: number }) => entry.version)
    ).toEqual([1, 2, 3]);
  });
});
