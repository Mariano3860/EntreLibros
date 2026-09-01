import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  commandAgreement,
  counterProposeAgreement,
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

async function listing(ownerId: number, title: string): Promise<number> {
  const book = await client.query<{ id: number }>(
    'INSERT INTO books (title) VALUES ($1) RETURNING id',
    [title]
  );
  const result = await client.query<{ id: number }>(
    `INSERT INTO book_listings (user_id, book_id, type, trade)
     VALUES ($1, $2, 'offer', true) RETURNING id`,
    [ownerId, book.rows[0].id]
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
  test('preserves immutable versions and rejects commands from the proposal author', async () => {
    const proposer = await user('proposer');
    const participant = await user('participant');
    const conversation = await createConversation([proposer, participant]);
    const agreement = await createAgreement({
      conversationId: conversation.id,
      proposerId: proposer,
      participantId: participant,
      details,
    });

    await expect(
      commandAgreement({
        id: agreement.id,
        actorId: proposer,
        expectedVersion: 1,
        command: 'confirm',
      })
    ).rejects.toThrow('agreements.errors.forbidden');
    await expect(
      commandAgreement({
        id: agreement.id,
        actorId: proposer,
        expectedVersion: 1,
        command: 'reject',
        reason: 'Necesito revisar la propuesta.',
      })
    ).rejects.toThrow('agreements.errors.forbidden');

    const partial = await commandAgreement({
      id: agreement.id,
      actorId: participant,
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

  test('reserves both listings atomically and releases them on cancellation', async () => {
    const proposer = await user('reserve-proposer');
    const participant = await user('reserve-participant');
    const conversation = await createConversation([proposer, participant]);
    const firstListing = await listing(proposer, 'First book');
    const secondListing = await listing(participant, 'Second book');
    const agreement = await createAgreement({
      conversationId: conversation.id,
      proposerId: proposer,
      participantId: participant,
      details,
      listingIds: [firstListing, secondListing],
    });

    const partial = await commandAgreement({
      id: agreement.id,
      actorId: participant,
      expectedVersion: 1,
      command: 'confirm',
    });
    const confirmed = await commandAgreement({
      id: agreement.id,
      actorId: proposer,
      expectedVersion: partial.currentVersion,
      command: 'confirm',
    });
    expect(confirmed.state).toBe('confirmed');
    expect(confirmed.listingIds).toEqual(
      expect.arrayContaining([firstListing, secondListing])
    );
    const reserved = await client.query<{ status: string }>(
      `SELECT status FROM book_listings WHERE id = ANY($1::integer[]) ORDER BY id`,
      [[firstListing, secondListing]]
    );
    expect(reserved.rows.map((row) => row.status)).toEqual([
      'reserved',
      'reserved',
    ]);

    await commandAgreement({
      id: agreement.id,
      actorId: proposer,
      expectedVersion: confirmed.currentVersion,
      command: 'complete',
    });
    const released = await client.query<{ status: string }>(
      `SELECT status FROM book_listings WHERE id = ANY($1::integer[]) ORDER BY id`,
      [[firstListing, secondListing]]
    );
    expect(released.rows.map((row) => row.status)).toEqual([
      'available',
      'available',
    ]);
  });

  test('creates immutable counterproposal versions with the acting participant', async () => {
    const proposer = await user('counter-proposer');
    const participant = await user('counter-participant');
    const conversation = await createConversation([proposer, participant]);
    const agreement = await createAgreement({
      conversationId: conversation.id,
      proposerId: proposer,
      participantId: participant,
      details,
    });
    const counter = await counterProposeAgreement({
      id: agreement.id,
      actorId: participant,
      expectedVersion: agreement.currentVersion,
      details: { ...details, time: '19:00' },
    });
    expect(counter.currentVersion).toBe(2);
    expect(counter.details.time).toBe('19:00');
    const history = await getAgreementHistory(agreement.id, participant);
    expect(history.map((entry) => entry.version)).toEqual([1, 2]);
    expect(history[0]?.actorId).toBe(proposer);
    expect(history[0]?.details.time).toBe('18:00');
    expect(history[1]?.actorId).toBe(participant);
  });
});
