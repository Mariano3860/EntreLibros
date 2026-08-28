import { afterEach, describe, expect, test } from 'vitest';

import { pool } from '../../src/db.js';
import {
  listMessages,
  sendMessage,
  createConversation,
} from '../../src/repositories/messagingRepository.js';

let conversationId: number | undefined;
let userIds: number[] = [];

afterEach(async () => {
  if (conversationId !== undefined) {
    await pool.query('DELETE FROM conversations WHERE id = $1', [
      conversationId,
    ]);
  }
  if (userIds.length > 0) {
    await pool.query('DELETE FROM users WHERE id = ANY($1::integer[])', [
      userIds,
    ]);
  }
  conversationId = undefined;
  userIds = [];
});

async function createUser(label: string): Promise<number> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, 'test-hash') RETURNING id`,
    [label, `reconnect-${label}-${Date.now()}@example.com`]
  );
  const id = result.rows[0].id;
  userIds.push(id);
  return id;
}

describe('messaging cursor recovery', () => {
  test('returns exactly the messages missed after a reconnect cursor', async () => {
    const firstUser = await createUser('sender');
    const secondUser = await createUser('receiver');
    const conversation = await createConversation([firstUser, secondUser]);
    conversationId = conversation.id;

    await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'cursor-1',
      body: 'one',
    });
    await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'cursor-2',
      body: 'two',
    });
    const cursor = 1;
    await sendMessage({
      conversationId: conversation.id,
      senderId: firstUser,
      clientKey: 'cursor-3',
      body: 'three',
    });

    const missed = await listMessages(conversation.id, secondUser, {
      after: cursor,
    });
    expect(missed.map((message) => message.sequence)).toEqual([2, 3]);
    expect(missed.map((message) => message.body)).toEqual(['two', 'three']);
  });
});
