import { afterEach, describe, expect, test } from 'vitest';

import { pool } from '../../src/db.js';
import {
  commandAgreement,
  createAgreement,
} from '../../src/repositories/agreementRepository.js';
import { createConversation } from '../../src/repositories/messagingRepository.js';

let agreementId: number | undefined;
let userIds: number[] = [];

afterEach(async () => {
  if (agreementId !== undefined) {
    await pool.query('DELETE FROM exchange_agreements WHERE id = $1', [
      agreementId,
    ]);
  }
  if (userIds.length > 0) {
    await pool.query('DELETE FROM users WHERE id = ANY($1::integer[])', [
      userIds,
    ]);
  }
  agreementId = undefined;
  userIds = [];
});

async function createUser(label: string): Promise<number> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, 'test-hash') RETURNING id`,
    [label, `concurrency-${label}-${Date.now()}@example.com`]
  );
  const id = result.rows[0].id;
  userIds.push(id);
  return id;
}

describe('agreement concurrency', () => {
  test('commits one simultaneous confirmation and conflicts the other', async () => {
    const proposer = await createUser('proposer');
    const participant = await createUser('participant');
    const conversation = await createConversation([proposer, participant]);
    const agreement = await createAgreement({
      conversationId: conversation.id,
      proposerId: proposer,
      participantId: participant,
      details: {
        meetingPoint: 'Biblioteca',
        area: 'Centro',
        date: '2026-09-01',
        time: '18:00',
        bookTitle: 'Dune',
      },
    });
    agreementId = agreement.id;

    const outcomes = await Promise.allSettled([
      commandAgreement({
        id: agreement.id,
        actorId: proposer,
        expectedVersion: 1,
        command: 'confirm',
      }),
      commandAgreement({
        id: agreement.id,
        actorId: participant,
        expectedVersion: 1,
        command: 'confirm',
      }),
    ]);

    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled')
    ).toHaveLength(1);
    const conflicts = outcomes.filter(
      (outcome) =>
        outcome.status === 'rejected' &&
        String(outcome.reason).includes('agreements.errors.conflict')
    );
    expect(conflicts).toHaveLength(1);
  });
});
