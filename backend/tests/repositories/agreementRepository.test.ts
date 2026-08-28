import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  commandAgreement,
  createAgreement,
  getAgreementHistory,
} from '../../src/repositories/agreementRepository.js';
import { createConversation } from '../../src/repositories/messagingRepository.js';

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

async function user(label: string): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, 'test-hash') RETURNING id`,
    [label, `agreement-${label}-${Date.now()}@example.com`]
  );
  return result.rows[0].id;
}

const details = {
  meetingPoint: 'Biblioteca',
  area: 'Centro',
  date: '2026-09-01',
  time: '18:00',
  bookTitle: 'Dune',
};

describe('agreementRepository', () => {
  test('preserves immutable versions and rejects stale commands', async () => {
    const proposer = await user('proposer');
    const participant = await user('participant');
    const conversation = await createConversation([proposer, participant]);
    const agreement = await createAgreement({
      conversationId: conversation.id,
      proposerId: proposer,
      participantId: participant,
      details,
    });

    const partial = await commandAgreement({
      id: agreement.id,
      actorId: proposer,
      expectedVersion: 1,
      command: 'confirm',
    });
    expect(partial.state).toBe('partially_confirmed');
    await expect(
      commandAgreement({
        id: agreement.id,
        actorId: participant,
        expectedVersion: 1,
        command: 'confirm',
      })
    ).rejects.toThrow('agreements.errors.conflict');

    const history = await getAgreementHistory(agreement.id, participant);
    expect(history.map((entry) => entry.version)).toEqual([1, 2]);
    expect(history[0]?.state).toBe('proposed');
    expect(history[0]?.details).toEqual(details);
  });
});
