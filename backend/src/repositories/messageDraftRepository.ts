import {
  counterProposeAgreementWithClient,
  createAgreementWithClient,
  agreementEvents,
  type AgreementSnapshot,
} from './agreementRepository.js';
import {
  sendMessageWithClient,
  findMessageWithClient,
  validateMessageAttachment,
  type MessageAgreementDetails,
  type MessageAttachment,
  type PersistedMessage,
} from './messagingRepository.js';
import { withTransaction, type DbClient } from '../db.js';

type DraftBookAttachment = Extract<MessageAttachment, { kind: 'book' }>;
type DraftSwapAttachment = Extract<MessageAttachment, { kind: 'swap' }>;

export type MessageDraftAttachment =
  | DraftBookAttachment
  | DraftSwapAttachment
  | {
      key: string;
      contentType: string;
      size: number;
      name?: string;
      kind: 'agreementProposal';
      listingIds: number[];
      details: MessageAgreementDetails;
      agreementId?: number;
      expectedVersion?: number;
    };

export interface MessageDraft {
  id: number;
  conversationId: number;
  authorId: number;
  body: string;
  attachmentMetadata: MessageDraftAttachment | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageDraftRow {
  id: number;
  conversation_id: number;
  author_id: number;
  body: string;
  attachment_metadata: MessageDraftAttachment | null;
  revision: number;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertMessageDraftInput {
  conversationId: number;
  authorId: number;
  body: string;
  attachmentMetadata?: MessageDraftAttachment | null;
  revision?: number;
}

function mapDraft(row: MessageDraftRow): MessageDraft {
  return {
    id: Number(row.id),
    conversationId: Number(row.conversation_id),
    authorId: Number(row.author_id),
    body: row.body,
    attachmentMetadata: row.attachment_metadata,
    revision: Number(row.revision),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertParticipant(
  client: DbClient,
  conversationId: number,
  userId: number
): Promise<number[]> {
  const { rows } = await client.query<{ user_id: number }>(
    `SELECT user_id
     FROM conversation_participants
     WHERE conversation_id = $1
     ORDER BY user_id`,
    [conversationId]
  );
  const participantIds = rows.map((row) => Number(row.user_id));
  if (!participantIds.includes(userId)) {
    throw new Error('messaging.errors.forbidden');
  }
  return participantIds;
}

function assertDetails(details: MessageAgreementDetails): void {
  const fields: (keyof MessageAgreementDetails)[] = [
    'meetingPoint',
    'area',
    'date',
    'time',
    'bookTitle',
  ];
  if (
    fields.some(
      (field) =>
        typeof details[field] !== 'string' ||
        details[field].trim().length === 0 ||
        details[field].length > 240
    ) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(details.date) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(details.time) ||
    Number.isNaN(Date.parse(`${details.date}T${details.time}:00Z`)) ||
    new Date(`${details.date}T${details.time}:00Z`)
      .toISOString()
      .startsWith(`${details.date}T${details.time}`) === false
  ) {
    throw new Error('messaging.errors.invalid_draft');
  }
}

async function validateDraftAttachment(
  client: DbClient,
  input: {
    conversationId: number;
    authorId: number;
    attachmentMetadata: MessageDraftAttachment;
  }
): Promise<void> {
  const attachment = input.attachmentMetadata;
  if (
    !attachment.key.trim() ||
    attachment.key.length > 240 ||
    !attachment.contentType.trim() ||
    attachment.contentType.length > 240 ||
    !Number.isSafeInteger(attachment.size) ||
    attachment.size < 1 ||
    attachment.size > 10_000_000 ||
    (attachment.name !== undefined && attachment.name.length > 240)
  ) {
    throw new Error('messaging.errors.draft_attachment_invalid');
  }
  const participantIds = await assertParticipant(
    client,
    input.conversationId,
    input.authorId
  );
  if (input.attachmentMetadata.kind === 'agreementProposal') {
    const hasAgreementId = input.attachmentMetadata.agreementId !== undefined;
    const hasExpectedVersion =
      input.attachmentMetadata.expectedVersion !== undefined;
    if (
      hasAgreementId !== hasExpectedVersion ||
      (hasAgreementId &&
        (!Number.isSafeInteger(input.attachmentMetadata.agreementId) ||
          (input.attachmentMetadata.agreementId ?? 0) < 1 ||
          !Number.isSafeInteger(input.attachmentMetadata.expectedVersion) ||
          (input.attachmentMetadata.expectedVersion ?? 0) < 1))
    ) {
      throw new Error('messaging.errors.draft_attachment_invalid');
    }
    const listingIds = [...new Set(input.attachmentMetadata.listingIds)];
    if (listingIds.length === 0 || listingIds.length > 2) {
      throw new Error('messaging.errors.draft_attachment_invalid');
    }
    assertDetails(input.attachmentMetadata.details);
    const { rows } = await client.query<{
      id: number;
      user_id: number;
      status: string;
      availability: string;
      is_draft: boolean;
    }>(
      `SELECT id, user_id, status, availability, is_draft
       FROM book_listings
       WHERE id = ANY($1::integer[])
         AND (expires_at IS NULL OR expires_at > NOW())
       FOR UPDATE`,
      [listingIds]
    );
    if (
      rows.length !== listingIds.length ||
      rows.some(
        (listing) =>
          listing.status !== 'available' ||
          listing.availability !== 'public' ||
          listing.is_draft ||
          !participantIds.includes(listing.user_id)
      )
    ) {
      throw new Error('messaging.errors.draft_attachment_invalid');
    }
    return;
  }

  await validateMessageAttachment(client, {
    conversationId: input.conversationId,
    senderId: input.authorId,
    attachmentMetadata: input.attachmentMetadata,
  });
}

async function validateDraftInput(
  client: DbClient,
  input: UpsertMessageDraftInput
): Promise<void> {
  const body = input.body.trim();
  if (input.body.length > 4000) {
    throw new Error('messaging.errors.invalid_draft');
  }
  if (!body && !input.attachmentMetadata) {
    throw new Error('messaging.errors.body_required');
  }
  if (input.attachmentMetadata) {
    await validateDraftAttachment(client, {
      conversationId: input.conversationId,
      authorId: input.authorId,
      attachmentMetadata: input.attachmentMetadata,
    });
  } else {
    await assertParticipant(client, input.conversationId, input.authorId);
  }
}

const DRAFT_SELECT = `
  SELECT id, conversation_id, author_id, body, attachment_metadata,
         revision, created_at, updated_at
  FROM message_drafts`;

export async function getMessageDraft(
  conversationId: number,
  authorId: number
): Promise<MessageDraft | null> {
  return withTransaction(async (client) => {
    await assertParticipant(client, conversationId, authorId);
    const { rows } = await client.query<MessageDraftRow>(
      `${DRAFT_SELECT}
       WHERE conversation_id = $1 AND author_id = $2`,
      [conversationId, authorId]
    );
    return rows[0] ? mapDraft(rows[0]) : null;
  });
}

export async function upsertMessageDraft(
  input: UpsertMessageDraftInput
): Promise<MessageDraft> {
  return withTransaction(async (client) => {
    await validateDraftInput(client, input);
    const current = await client.query<{ revision: number }>(
      `SELECT revision
       FROM message_drafts
       WHERE conversation_id = $1 AND author_id = $2
       FOR UPDATE`,
      [input.conversationId, input.authorId]
    );
    const currentRevision = current.rows[0]?.revision ?? 0;
    if (input.revision !== undefined && input.revision !== currentRevision) {
      throw new Error('messaging.errors.draft_conflict');
    }
    const saved = await client.query<MessageDraftRow>(
      `INSERT INTO message_drafts
       (conversation_id, author_id, body, attachment_metadata, revision)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (conversation_id, author_id) DO UPDATE
       SET body = EXCLUDED.body,
           attachment_metadata = EXCLUDED.attachment_metadata,
           revision = message_drafts.revision + 1,
           updated_at = NOW()
       RETURNING id, conversation_id, author_id, body, attachment_metadata,
                 revision, created_at, updated_at`,
      [
        input.conversationId,
        input.authorId,
        input.body.trim(),
        input.attachmentMetadata ?? null,
      ]
    );
    if (!saved.rows[0]) {
      throw new Error('messaging.errors.invalid_draft');
    }
    return mapDraft(saved.rows[0]);
  });
}

export async function deleteMessageDraft(
  conversationId: number,
  authorId: number,
  revision?: number
): Promise<void> {
  await withTransaction(async (client) => {
    await assertParticipant(client, conversationId, authorId);
    const result = await client.query<{ revision: number }>(
      `SELECT revision
       FROM message_drafts
       WHERE conversation_id = $1 AND author_id = $2
       FOR UPDATE`,
      [conversationId, authorId]
    );
    const currentRevision = result.rows[0]?.revision;
    if (currentRevision === undefined) {
      throw new Error('messaging.errors.draft_not_found');
    }
    if (revision !== undefined && revision !== currentRevision) {
      throw new Error('messaging.errors.draft_conflict');
    }
    await client.query(
      `DELETE FROM message_drafts
       WHERE conversation_id = $1 AND author_id = $2`,
      [conversationId, authorId]
    );
  });
}

export interface SendMessageDraftInput {
  conversationId: number;
  authorId: number;
  clientKey: string;
  revision?: number;
}

export interface SendMessageDraftResult {
  message: PersistedMessage;
  created: boolean;
  agreementId?: number;
  agreement?: AgreementSnapshot;
}

export async function sendMessageDraft(
  input: SendMessageDraftInput
): Promise<SendMessageDraftResult> {
  if (!input.clientKey.trim()) {
    throw new Error('messaging.errors.client_key_required');
  }

  const result = await withTransaction(async (client) => {
    await assertParticipant(client, input.conversationId, input.authorId);
    const existingMessage = await findMessageWithClient(client, {
      conversationId: input.conversationId,
      senderId: input.authorId,
      clientKey: input.clientKey,
    });
    if (existingMessage) {
      await client.query(
        `DELETE FROM message_drafts
         WHERE conversation_id = $1 AND author_id = $2`,
        [input.conversationId, input.authorId]
      );
      return { message: existingMessage, created: false };
    }
    const conversation = await client.query<{ id: number }>(
      `SELECT id FROM conversations WHERE id = $1 FOR UPDATE`,
      [input.conversationId]
    );
    if (!conversation.rows[0]) {
      throw new Error('messaging.errors.not_found');
    }
    const existingAfterLock = await findMessageWithClient(client, {
      conversationId: input.conversationId,
      senderId: input.authorId,
      clientKey: input.clientKey,
    });
    if (existingAfterLock) {
      await client.query(
        `DELETE FROM message_drafts
         WHERE conversation_id = $1 AND author_id = $2`,
        [input.conversationId, input.authorId]
      );
      return { message: existingAfterLock, created: false };
    }
    const draftResult = await client.query<MessageDraftRow>(
      `${DRAFT_SELECT}
       WHERE conversation_id = $1 AND author_id = $2
       FOR UPDATE`,
      [input.conversationId, input.authorId]
    );
    const draft = draftResult.rows[0];
    if (!draft) throw new Error('messaging.errors.draft_not_found');
    if (input.revision !== undefined && input.revision !== draft.revision) {
      throw new Error('messaging.errors.draft_conflict');
    }
    const attachment = draft.attachment_metadata;
    await validateDraftInput(client, {
      conversationId: input.conversationId,
      authorId: input.authorId,
      body: draft.body,
      attachmentMetadata: attachment,
      revision: draft.revision,
    });

    let messageAttachment: MessageAttachment | null =
      attachment && attachment.kind !== 'agreementProposal' ? attachment : null;
    let agreementId: number | undefined;
    let agreementSnapshot: AgreementSnapshot | undefined;
    if (attachment?.kind === 'agreementProposal') {
      const participantIds = await assertParticipant(
        client,
        input.conversationId,
        input.authorId
      );
      const participantId = participantIds.find(
        (participantId) => participantId !== input.authorId
      );
      if (!participantId) {
        throw new Error('messaging.errors.forbidden');
      }
      const agreement = attachment.agreementId
        ? await counterProposeAgreementWithClient(client, {
            id: attachment.agreementId,
            actorId: input.authorId,
            expectedVersion: attachment.expectedVersion ?? 0,
            details: attachment.details,
            conversationId: input.conversationId,
          })
        : await createAgreementWithClient(client, {
            conversationId: input.conversationId,
            proposerId: input.authorId,
            participantId,
            details: attachment.details,
            listingIds: attachment.listingIds,
          });
      const actor = await client.query<{ name: string }>(
        'SELECT name FROM users WHERE id = $1',
        [input.authorId]
      );
      if (!actor.rows[0]) throw new Error('messaging.errors.forbidden');
      agreementSnapshot = agreement;
      messageAttachment = {
        key: `agreement:${agreement.id}:${agreement.currentVersion}`,
        contentType: 'application/x-entrelibros-agreement',
        size: 1,
        name: agreement.details.bookTitle,
        kind: 'agreement',
        agreementId: agreement.id,
        version: agreement.currentVersion,
        event: attachment.agreementId ? 'counterproposal' : 'proposal',
        details: agreement.details,
        listingIds: agreement.listingIds,
        actorName: actor.rows[0].name,
      };
      agreementId = agreement.id;
    }

    const result = await sendMessageWithClient(client, {
      conversationId: input.conversationId,
      senderId: input.authorId,
      clientKey: input.clientKey,
      body: draft.body,
      attachmentMetadata: messageAttachment,
    });
    await client.query(
      `DELETE FROM message_drafts
       WHERE conversation_id = $1 AND author_id = $2`,
      [input.conversationId, input.authorId]
    );
    return {
      ...result,
      ...(agreementId ? { agreementId, agreement: agreementSnapshot } : {}),
    };
  });
  if (result.agreement) agreementEvents.emit('committed', result.agreement);
  return result;
}
