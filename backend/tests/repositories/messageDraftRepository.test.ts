import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  deleteMessageDraft,
  getMessageDraft,
  sendMessageDraft,
  upsertMessageDraft,
} from '../../src/repositories/messageDraftRepository.js';
import {
  createConversation,
  listConversations,
  listMessages,
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

async function createUser(label: string): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, 'test-hash') RETURNING id`,
    [`Draft ${label}`, `draft-${label}-${Date.now()}@example.com`]
  );
  return result.rows[0].id;
}

async function createListing(ownerId: number, title: string): Promise<number> {
  const book = await client.query<{ id: number }>(
    'INSERT INTO books (title) VALUES ($1) RETURNING id',
    [title]
  );
  const listing = await client.query<{ id: number }>(
    `INSERT INTO book_listings (user_id, book_id, type, trade)
     VALUES ($1, $2, 'offer', true) RETURNING id`,
    [ownerId, book.rows[0].id]
  );
  return listing.rows[0].id;
}

function bookReference(id: number, title: string) {
  return {
    id: String(id),
    title,
    author: 'Autora de prueba',
    coverUrl: 'https://example.com/cover.jpg',
  };
}

describe('messageDraftRepository', () => {
  test('creates, updates and rejects stale revisions without touching messages', async () => {
    const authorId = await createUser('author');
    const participantId = await createUser('participant');
    const conversation = await createConversation([authorId, participantId]);

    const first = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: 'Primer borrador',
    });
    const second = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: 'Borrador actualizado',
      revision: first.revision,
    });

    expect(second.id).toBe(first.id);
    expect(second.revision).toBe(first.revision + 1);
    await expect(
      upsertMessageDraft({
        conversationId: conversation.id,
        authorId,
        body: 'Edición obsoleta',
        revision: first.revision,
      })
    ).rejects.toThrow('messaging.errors.draft_conflict');
    await expect(getMessageDraft(conversation.id, participantId)).resolves.toBe(
      null
    );
    await expect(listMessages(conversation.id, participantId)).resolves.toEqual(
      []
    );
  });

  test('validates book and swap ownership, then preserves a draft when availability changes', async () => {
    const authorId = await createUser('swap-author');
    const participantId = await createUser('swap-participant');
    const outsiderId = await createUser('swap-outsider');
    const conversation = await createConversation([authorId, participantId]);
    const offeredId = await createListing(authorId, 'Libro ofrecido');
    const requestedId = await createListing(participantId, 'Libro solicitado');
    const outsiderListingId = await createListing(outsiderId, 'Libro ajeno');

    await expect(
      upsertMessageDraft({
        conversationId: conversation.id,
        authorId,
        body: '',
        attachmentMetadata: {
          key: `swap:${offeredId}:${outsiderListingId}`,
          contentType: 'application/x-entrelibros-swap',
          size: 1,
          kind: 'swap',
          offered: bookReference(offeredId, 'Libro ofrecido'),
          requested: bookReference(outsiderListingId, 'Libro ajeno'),
        },
      })
    ).rejects.toThrow('messaging.errors.forbidden');

    const draft = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: '¿Te interesa?',
      attachmentMetadata: {
        key: `swap:${offeredId}:${requestedId}`,
        contentType: 'application/x-entrelibros-swap',
        size: 1,
        kind: 'swap',
        offered: bookReference(offeredId, 'Libro ofrecido'),
        requested: bookReference(requestedId, 'Libro solicitado'),
      },
    });
    await client.query(
      "UPDATE book_listings SET status = 'reserved' WHERE id = $1",
      [requestedId]
    );

    await expect(
      sendMessageDraft({
        conversationId: conversation.id,
        authorId,
        clientKey: 'swap-send-1',
        revision: draft.revision,
      })
    ).rejects.toThrow('messaging.errors.forbidden');
    await expect(
      getMessageDraft(conversation.id, authorId)
    ).resolves.toMatchObject({
      id: draft.id,
      revision: draft.revision,
    });
  });

  test('sends text once, removes only the draft and keeps retry idempotent', async () => {
    const authorId = await createUser('send-author');
    const participantId = await createUser('send-participant');
    const conversation = await createConversation([authorId, participantId]);
    const draft = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: 'Mensaje preparado',
    });

    const first = await sendMessageDraft({
      conversationId: conversation.id,
      authorId,
      clientKey: 'draft-send-1',
      revision: draft.revision,
    });
    const retry = await sendMessageDraft({
      conversationId: conversation.id,
      authorId,
      clientKey: 'draft-send-1',
    });

    expect(first.created).toBe(true);
    expect(retry.created).toBe(false);
    expect(retry.message.id).toBe(first.message.id);
    await expect(getMessageDraft(conversation.id, authorId)).resolves.toBe(
      null
    );
    await expect(listMessages(conversation.id, participantId)).resolves.toEqual(
      [
        expect.objectContaining({
          id: first.message.id,
          body: 'Mensaje preparado',
        }),
      ]
    );
    await expect(listConversations(participantId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: conversation.id, unreadCount: 1 }),
      ])
    );
  });

  test('creates agreement and proposal message atomically when an agreement draft is sent', async () => {
    const authorId = await createUser('agreement-author');
    const participantId = await createUser('agreement-participant');
    const conversation = await createConversation([authorId, participantId]);
    const listingId = await createListing(authorId, 'Libro del acuerdo');
    const details = {
      meetingPoint: 'Biblioteca',
      area: 'Centro',
      date: '2026-09-14',
      time: '18:00',
      bookTitle: 'Libro del acuerdo',
    };
    const draft = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: '',
      attachmentMetadata: {
        key: `agreement-proposal:${listingId}`,
        contentType: 'application/x-entrelibros-agreement-proposal',
        size: 1,
        kind: 'agreementProposal',
        listingIds: [listingId],
        details,
      },
    });

    const result = await sendMessageDraft({
      conversationId: conversation.id,
      authorId,
      clientKey: 'agreement-draft-send-1',
      revision: draft.revision,
    });

    expect(result.created).toBe(true);
    expect(result.agreementId).toBeTypeOf('number');
    expect(result.message.attachmentMetadata).toMatchObject({
      kind: 'agreement',
      event: 'proposal',
      agreementId: result.agreementId,
      details,
      listingIds: [listingId],
    });
    const agreement = await client.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM exchange_agreements
       WHERE id = $1 AND conversation_id = $2`,
      [result.agreementId, conversation.id]
    );
    expect(agreement.rows[0].count).toBe(1);
    await expect(getMessageDraft(conversation.id, authorId)).resolves.toBe(
      null
    );
  });

  test('sends a saved counterproposal against the same agreement version', async () => {
    const authorId = await createUser('counter-author');
    const participantId = await createUser('counter-participant');
    const conversation = await createConversation([authorId, participantId]);
    const listingId = await createListing(authorId, 'Libro para cambiar');
    const initialDetails = {
      meetingPoint: 'Plaza central',
      area: 'Centro',
      date: '2026-09-14',
      time: '18:00',
      bookTitle: 'Libro para cambiar',
    };
    const agreement = await client.query<{ id: number }>(
      `INSERT INTO exchange_agreements
       (conversation_id, proposer_id, participant_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [conversation.id, authorId, participantId]
    );
    const agreementId = Number(agreement.rows[0].id);
    await client.query(
      `INSERT INTO exchange_agreement_versions
       (agreement_id, version, actor_id, details)
       VALUES ($1, 1, $2, $3)`,
      [agreementId, authorId, JSON.stringify(initialDetails)]
    );
    await client.query(
      `INSERT INTO exchange_agreement_items
       (agreement_id, version, listing_id, owner_id)
       VALUES ($1, 1, $2, $3)`,
      [agreementId, listingId, authorId]
    );
    await client.query(
      `INSERT INTO agreement_events (agreement_id, version, actor_id, event_type)
       VALUES ($1, 1, $2, 'proposal')`,
      [agreementId, authorId]
    );

    const draft = await upsertMessageDraft({
      conversationId: conversation.id,
      authorId: participantId,
      body: '',
      attachmentMetadata: {
        key: `agreement-proposal:${agreementId}`,
        contentType: 'application/x-entrelibros-agreement-proposal',
        size: 1,
        kind: 'agreementProposal',
        agreementId,
        expectedVersion: 1,
        listingIds: [listingId],
        details: { ...initialDetails, meetingPoint: 'Biblioteca' },
      },
    });

    const result = await sendMessageDraft({
      conversationId: conversation.id,
      authorId: participantId,
      clientKey: 'counter-draft-send-1',
      revision: draft.revision,
    });

    expect(result.agreementId).toBe(agreementId);
    expect(result.message.attachmentMetadata).toMatchObject({
      kind: 'agreement',
      event: 'counterproposal',
      agreementId,
      version: 2,
    });
    await expect(getMessageDraft(conversation.id, participantId)).resolves.toBe(
      null
    );
  });

  test('cascades drafts when their conversation is removed', async () => {
    const authorId = await createUser('cascade-author');
    const participantId = await createUser('cascade-participant');
    const conversation = await createConversation([authorId, participantId]);
    await upsertMessageDraft({
      conversationId: conversation.id,
      authorId,
      body: 'Borrador descartable',
    });

    await client.query('DELETE FROM conversations WHERE id = $1', [
      conversation.id,
    ]);
    const drafts = await client.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM message_drafts WHERE conversation_id = $1',
      [conversation.id]
    );
    expect(drafts.rows[0].count).toBe(0);
    await expect(deleteMessageDraft(conversation.id, authorId)).rejects.toThrow(
      'messaging.errors.forbidden'
    );
  });
});
