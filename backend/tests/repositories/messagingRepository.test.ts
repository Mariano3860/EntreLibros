import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  createConversation,
  listMessages,
  sendMessage,
} from '../../src/repositories/messagingRepository.js';

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

async function createUser(suffix: string): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, 'test-hash') RETURNING id`,
    [`Test ${suffix}`, `messaging-${suffix}-${Date.now()}@example.com`]
  );
  return result.rows[0].id;
}

describe('messagingRepository', () => {
  test('orders messages and returns the same row for an idempotent retry', async () => {
    const firstUser = await createUser('one');
    const secondUser = await createUser('two');
    const conversation = await createConversation([firstUser, secondUser]);

    const first = await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'client-1',
      body: 'Primero',
    });
    const retry = await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'client-1',
      body: 'Primero',
    });
    const second = await sendMessage({
      conversationId: conversation.id,
      senderId: secondUser,
      clientKey: 'client-2',
      body: 'Segundo',
    });

    expect(retry.id).toBe(first.id);
    expect(second.sequence).toBe(first.sequence + 1);
    await expect(
      listMessages(conversation.id, firstUser)
    ).resolves.toMatchObject([
      { sequence: 1, body: 'Primero' },
      { sequence: 2, body: 'Segundo' },
    ]);
  });

  test('does not reveal a conversation to a third user', async () => {
    const firstUser = await createUser('member');
    const secondUser = await createUser('member-two');
    const thirdUser = await createUser('outsider');
    const conversation = await createConversation([firstUser, secondUser]);

    await expect(listMessages(conversation.id, thirdUser)).rejects.toThrow(
      'messaging.errors.forbidden'
    );
  });
});
