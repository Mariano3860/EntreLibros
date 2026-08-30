import { query, withTransaction, type DbClient } from '../db.js';

export interface ConversationSummary {
  id: number;
  isBot: boolean;
  participantIds: number[];
  agreementId: number | null;
  lastMessageSequence: number;
  updatedAt: Date;
  participantName: string | null;
}

export interface MessageAttachment {
  key: string;
  contentType: string;
  size: number;
  name?: string;
  kind?: 'book';
  bookId?: string;
  title?: string;
  author?: string;
  coverUrl?: string;
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
  is_bot: boolean;
  participant_ids: number[];
  agreement_id: number | null;
  last_message_sequence: string;
  updated_at: Date;
  participant_name?: string | null;
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
    isBot: row.is_bot,
    participantIds: row.participant_ids.map(Number),
    agreementId: row.agreement_id === null ? null : Number(row.agreement_id),
    lastMessageSequence: Number(row.last_message_sequence),
    updatedAt: row.updated_at,
    participantName: row.participant_name ?? null,
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
         BOOL_OR(participant_user.role = 'bot') AS is_bot,
         MAX(a.id) AS agreement_id,
         c.last_message_sequence,
         c.updated_at
  FROM conversations c
  JOIN conversation_participants cp ON cp.conversation_id = c.id
  JOIN users participant_user ON participant_user.id = cp.user_id
  LEFT JOIN exchange_agreements a ON a.conversation_id = c.id
`;

const BOT_EMAIL = 'bot@entrelibros.local';

export async function ensureBotConversation(
  userId: number
): Promise<ConversationSummary> {
  // Serialize creation per user/bot pair so concurrent page loads cannot
  // create duplicate conversations. The transaction also makes the lookup
  // and participant inserts visible atomically to the rest of the service.
  return withTransaction(async (client) => {
    const botResult = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE email = $1 AND role = 'bot'",
      [BOT_EMAIL]
    );
    const botId = botResult.rows[0]?.id;
    if (!botId) throw new Error('messaging.errors.bot_not_configured');

    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [userId, botId]);
    const existing = await client.query<ConversationRow>(
      `${CONVERSATION_SELECT}
       WHERE EXISTS (
         SELECT 1 FROM conversation_participants mine
         WHERE mine.conversation_id = c.id AND mine.user_id = $1
       )
       AND EXISTS (
         SELECT 1 FROM conversation_participants bot_member
         WHERE bot_member.conversation_id = c.id AND bot_member.user_id = $2
       )
       GROUP BY c.id
       HAVING COUNT(cp.user_id) = 2
       LIMIT 1`,
      [userId, botId]
    );
    if (existing.rows[0]) return mapConversation(existing.rows[0]);

    const conversation = await client.query<{ id: number }>(
      'INSERT INTO conversations DEFAULT VALUES RETURNING id'
    );
    const conversationId = conversation.rows[0].id;
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, userId, botId]
    );
    const created = await client.query<ConversationRow>(
      `${CONVERSATION_SELECT}
       WHERE c.id = $1
       GROUP BY c.id`,
      [conversationId]
    );
    return mapConversation(created.rows[0]);
  });
}

export async function findBotIdForConversation(
  conversationId: number,
  userId: number
): Promise<number | null> {
  const { rows } = await query<{ id: number }>(
    `SELECT bot.id
     FROM conversation_participants bot_member
     JOIN users bot ON bot.id = bot_member.user_id AND bot.role = 'bot'
     WHERE bot_member.conversation_id = $1
       AND EXISTS (
         SELECT 1 FROM conversation_participants member
         WHERE member.conversation_id = $1 AND member.user_id = $2
       )`,
    [conversationId, userId]
  );
  return rows[0]?.id ?? null;
}

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

export async function listConversationParticipantIds(
  conversationId: number,
  userId: number
): Promise<number[]> {
  const { rows } = await query<{ user_id: number }>(
    `SELECT user_id
     FROM conversation_participants
     WHERE conversation_id = $1
       AND EXISTS (
         SELECT 1
         FROM conversation_participants membership
         WHERE membership.conversation_id = $1
           AND membership.user_id = $2
       )
     ORDER BY user_id`,
    [conversationId, userId]
  );
  if (!rows.some((row) => Number(row.user_id) === userId)) {
    throw new Error('messaging.errors.forbidden');
  }
  return rows.map((row) => Number(row.user_id));
}

export async function areUsersBlocked(
  firstUserId: number,
  secondUserId: number
): Promise<boolean> {
  const { rows } = await query<{ blocked: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM user_blocks
       WHERE (blocker_id = $1 AND blocked_id = $2)
          OR (blocker_id = $2 AND blocked_id = $1)
     ) AS blocked`,
    [firstUserId, secondUserId]
  );
  return rows[0]?.blocked ?? false;
}

export async function createConversation(
  participantIds: number[]
): Promise<ConversationSummary> {
  const uniqueIds = [...new Set(participantIds)].sort((a, b) => a - b);
  if (uniqueIds.length !== 2) {
    throw new Error('messaging.errors.participants_required');
  }

  return withTransaction(async (client) => {
    const blocked = await client.query<{ blocked: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM user_blocks
         WHERE (blocker_id = $1 AND blocked_id = $2)
            OR (blocker_id = $2 AND blocked_id = $1)
       ) AS blocked`,
      [uniqueIds[0], uniqueIds[1]]
    );
    if (blocked.rows[0]?.blocked) {
      throw new Error('messaging.errors.forbidden');
    }
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
  await ensureBotConversation(userId);
  const { rows } = await query<ConversationRow>(
    `${CONVERSATION_SELECT}
     WHERE EXISTS (
       SELECT 1 FROM conversation_participants mine
       WHERE mine.conversation_id = c.id AND mine.user_id = $1
     )
     GROUP BY c.id
     ORDER BY is_bot DESC, c.updated_at DESC`,
    [userId]
  );
  const conversations = rows.map(mapConversation);
  if (conversations.length === 0) return conversations;
  const names = await query<{ conversation_id: number; name: string }>(
    `SELECT cp.conversation_id, u.name
     FROM conversation_participants cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.conversation_id = ANY($1::bigint[]) AND cp.user_id <> $2
     ORDER BY cp.conversation_id, cp.user_id`,
    [conversations.map((conversation) => conversation.id), userId]
  );
  const nameByConversation = new Map<number, string>();
  for (const row of names.rows) {
    if (!nameByConversation.has(Number(row.conversation_id))) {
      nameByConversation.set(Number(row.conversation_id), row.name);
    }
  }
  return conversations.map((conversation) => ({
    ...conversation,
    participantName: nameByConversation.get(conversation.id) ?? null,
  }));
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
