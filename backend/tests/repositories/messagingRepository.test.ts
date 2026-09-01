import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  createConversation,
  ensureBotConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  sendMessageWithStatus,
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
  test('creates one persisted bot conversation and exposes its history', async () => {
    const userId = await createUser('bot-owner');

    const first = await ensureBotConversation(userId);
    const second = await ensureBotConversation(userId);

    expect(second.id).toBe(first.id);
    expect(first.isBot).toBe(true);

    const message = await sendMessage({
      conversationId: first.id,
      senderId: userId,
      clientKey: 'bot-check-1',
      body: 'Hola bot',
    });
    await expect(listMessages(first.id, userId)).resolves.toMatchObject([
      { id: message.id, body: 'Hola bot' },
    ]);
    await expect(listConversations(userId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: first.id, isBot: true }),
      ])
    );
  });

  test('orders messages and returns the same row for an idempotent retry', async () => {
    const firstUser = await createUser('one');
    const secondUser = await createUser('two');
    const conversation = await createConversation([firstUser, secondUser]);

    const firstResult = await sendMessageWithStatus({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'client-1',
      body: 'Primero',
    });
    const retryResult = await sendMessageWithStatus({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'client-1',
      body: 'Primero',
    });
    const first = firstResult.message;
    const retry = retryResult.message;
    const second = await sendMessage({
      conversationId: conversation.id,
      senderId: secondUser,
      clientKey: 'client-2',
      body: 'Segundo',
    });

    expect(retry.id).toBe(first.id);
    expect(firstResult.created).toBe(true);
    expect(retryResult.created).toBe(false);
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

  test('rejects a conversation with the same participant twice', async () => {
    const userId = await createUser('self-conversation');

    await expect(createConversation([userId, userId])).rejects.toThrow(
      'messaging.errors.self_conversation'
    );
  });

  test('counts only incoming messages as unread and clears the count on read', async () => {
    const firstUser = await createUser('unread-first');
    const secondUser = await createUser('unread-second');
    const conversation = await createConversation([firstUser, secondUser]);

    await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'unread-check-1',
      body: 'Mensaje propio',
    });
    await expect(listConversations(firstUser)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: conversation.id, unreadCount: 0 }),
      ])
    );
    await expect(listConversations(secondUser)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: conversation.id, unreadCount: 1 }),
      ])
    );

    await markConversationRead(conversation.id, secondUser, 1);
    await expect(listConversations(secondUser)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: conversation.id, unreadCount: 0 }),
      ])
    );
  });
});
