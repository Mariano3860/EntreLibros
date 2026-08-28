import { query, withTransaction, type DbClient } from '../db.js';

export interface ConversationSummary {
  id: number;
  participantIds: number[];
  lastMessageSequence: number;
  updatedAt: Date;
}

export interface MessageAttachment {
  key: string;
  contentType: string;
  size: number;
  name?: string;
}

export interface PersistedMessage {
  id: number;
  conversationId: number;
  senderId: number;
  sequence: number;
  clientKey: string;
  body: string;
  attachmentMetadata: MessageAttachment | null;
  createdAt: Date;
}

interface ConversationRow {
  id: number;
  participant_ids: number[];
  last_message_sequence: string;
  updated_at: Date;
}

interface MessageRow {
  id: number;
  conversation_id: number;
  sender_id: number;
  sequence: string;
  client_key: string;
  body: string;
  attachment_metadata: MessageAttachment | null;
  created_at: Date;
}

function mapConversation(row: ConversationRow): ConversationSummary {
  return {
    id: Number(row.id),
    participantIds: row.participant_ids.map(Number),
    lastMessageSequence: Number(row.last_message_sequence),
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: MessageRow): PersistedMessage {
  return {
    id: Number(row.id),
    conversationId: Number(row.conversation_id),
    senderId: Number(row.sender_id),
    sequence: Number(row.sequence),
    clientKey: row.client_key,
    body: row.body,
    attachmentMetadata: row.attachment_metadata,
    createdAt: row.created_at,
  };
}

const CONVERSATION_SELECT = `
  SELECT c.id,
         ARRAY_AGG(cp.user_id ORDER BY cp.user_id) AS participant_ids,
         c.last_message_sequence,
         c.updated_at
  FROM conversations c
  JOIN conversation_participants cp ON cp.conversation_id = c.id
`;

export async function isConversationParticipant(
  conversationId: number,
  userId: number
): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM conversation_participants
       WHERE conversation_id = $1 AND user_id = $2
     ) AS exists`,
    [conversationId, userId]
  );
  return rows[0]?.exists ?? false;
}

export async function createConversation(
  participantIds: number[]
): Promise<ConversationSummary> {
  const uniqueIds = [...new Set(participantIds)].sort((a, b) => a - b);
  if (uniqueIds.length !== 2) {
    throw new Error('messaging.errors.participants_required');
  }

  return withTransaction(async (client) => {
    const conversationResult = await client.query<{ id: number }>(
      'INSERT INTO conversations DEFAULT VALUES RETURNING id'
    );
    const conversationId = conversationResult.rows[0].id;
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, uniqueIds[0], uniqueIds[1]]
    );
    const { rows } = await client.query<ConversationRow>(
      `${CONVERSATION_SELECT}
       WHERE c.id = $1
       GROUP BY c.id`,
      [conversationId]
    );
    return mapConversation(rows[0]);
  });
}

export async function listConversations(
  userId: number
): Promise<ConversationSummary[]> {
  const { rows } = await query<ConversationRow>(
    `${CONVERSATION_SELECT}
     WHERE EXISTS (
       SELECT 1 FROM conversation_participants mine
       WHERE mine.conversation_id = c.id AND mine.user_id = $1
     )
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
    [userId]
  );
  return rows.map(mapConversation);
}

export async function listMessages(
  conversationId: number,
  userId: number,
  options: { after?: number; limit?: number } = {}
): Promise<PersistedMessage[]> {
  if (!(await isConversationParticipant(conversationId, userId))) {
    throw new Error('messaging.errors.forbidden');
  }
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const after = options.after ?? 0;
  const { rows } = await query<MessageRow>(
    `SELECT id, conversation_id, sender_id, sequence, client_key, body,
            attachment_metadata, created_at
     FROM messages
     WHERE conversation_id = $1 AND sequence > $2
     ORDER BY sequence ASC
     LIMIT $3`,
    [conversationId, after, limit]
  );
  return rows.map(mapMessage);
}

export async function sendMessage(input: {
  conversationId: number;
  senderId: number;
  clientKey: string;
  body: string;
  attachmentMetadata?: MessageAttachment | null;
}): Promise<PersistedMessage> {
  const body = input.body.trim();
  if (!body && !input.attachmentMetadata) {
    throw new Error('messaging.errors.body_required');
  }
  if (!input.clientKey.trim()) {
    throw new Error('messaging.errors.client_key_required');
  }

  return withTransaction(async (client) => {
    const membership = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM conversation_participants
         WHERE conversation_id = $1 AND user_id = $2
       ) AS exists`,
      [input.conversationId, input.senderId]
    );
    if (!membership.rows[0]?.exists) {
      throw new Error('messaging.errors.forbidden');
    }

    const existing = await client.query<MessageRow>(
      `SELECT id, conversation_id, sender_id, sequence, client_key, body,
              attachment_metadata, created_at
       FROM messages
       WHERE conversation_id = $1 AND sender_id = $2 AND client_key = $3`,
      [input.conversationId, input.senderId, input.clientKey]
    );
    if (existing.rows[0]) return mapMessage(existing.rows[0]);

    const conversation = await client.query<{ last_message_sequence: string }>(
      `SELECT last_message_sequence
       FROM conversations WHERE id = $1 FOR UPDATE`,
      [input.conversationId]
    );
    if (!conversation.rows[0]) {
      throw new Error('messaging.errors.not_found');
    }
    const sequence = Number(conversation.rows[0].last_message_sequence) + 1;
    await client.query(
      `UPDATE conversations
       SET last_message_sequence = $2, updated_at = NOW()
       WHERE id = $1`,
      [input.conversationId, sequence]
    );
    const { rows } = await client.query<MessageRow>(
      `INSERT INTO messages (
         conversation_id, sender_id, sequence, client_key, body, attachment_metadata
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, conversation_id, sender_id, sequence, client_key, body,
                 attachment_metadata, created_at`,
      [
        input.conversationId,
        input.senderId,
        sequence,
        input.clientKey,
        body,
        input.attachmentMetadata ?? null,
      ]
    );
    return mapMessage(rows[0]);
  });
}

export async function markConversationRead(
  conversationId: number,
  userId: number,
  sequence: number
): Promise<void> {
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new Error('messaging.errors.invalid_sequence');
  }
  await query(
    `UPDATE conversation_participants
     SET last_read_sequence = GREATEST(last_read_sequence, $3)
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId, sequence]
  );
}

export async function withMessagingClient<T>(
  work: (client: DbClient) => Promise<T>
): Promise<T> {
  return withTransaction(work);
}
