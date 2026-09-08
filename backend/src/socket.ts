import type { Server } from 'socket.io';
import jwt, { type Algorithm } from 'jsonwebtoken';
import { findUserById } from './repositories/userRepository.js';
import {
  isConversationParticipant,
  listConversations,
  markConversationRead,
  listMessages,
  sendMessageWithStatus,
  findBotIdForConversation,
  messageEvents,
  type MessageAttachment,
} from './repositories/messagingRepository.js';
import { logger } from './utils/logger.js';
import { generateReply } from './services/chatBot.js';
import { notifyMessageRecipients } from './services/notifications.js';
import { markMessageNotificationsRead } from './repositories/notificationRepository.js';
import {
  agreementEvents,
  type AgreementSnapshot,
} from './repositories/agreementRepository.js';
import { logPublicError, publicErrorResponse } from './utils/publicErrors.js';

const MAX_SOCKET_BODY_LENGTH = 4_000;
const MAX_SOCKET_CLIENT_KEY_LENGTH = 160;

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.trim().split('=');
    try {
      acc[key] = decodeURIComponent(rest.join('='));
    } catch {
      acc[key] = rest.join('='); // fallback to raw value if decoding fails
    }
    return acc;
  }, {});
}

interface ChatUser {
  id: number;
  name: string;
}

export interface ClientToServerEvents {
  'conversation:join': (
    payload: { conversationId: number; after?: number },
    acknowledge?: (joined: boolean) => void
  ) => void;
  'conversation:message': (payload: {
    conversationId: number;
    clientKey: string;
    body: string;
    attachmentMetadata?: MessageAttachment | null;
  }) => void;
  'conversation:read': (payload: {
    conversationId: number;
    sequence: number;
  }) => void;
}

export interface ServerToClientEvents {
  user: (user: ChatUser) => void;
  'conversation:message': (msg: {
    conversationId: number;
    sequence: number;
    senderId: number;
    body: string;
    clientKey: string;
    createdAt: string;
    attachmentMetadata: MessageAttachment | null;
  }) => void;
  'agreement:updated': (msg: {
    agreementId: number;
    conversationId: number;
    state: AgreementSnapshot['state'];
    currentVersion: number;
  }) => void;
  'conversation:error': (payload: { message: string }) => void;
}

export type InterServerEvents = Record<string, never>;

export interface SocketData {
  user: ChatUser;
}

type ConversationMessagePayload = {
  conversationId: number;
  clientKey: string;
  body: string;
  attachmentMetadata?: MessageAttachment | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isConversationId(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function isValidConversationMessage(
  value: unknown
): value is ConversationMessagePayload {
  if (!isRecord(value)) return false;
  if (
    !isConversationId(value.conversationId) ||
    typeof value.clientKey !== 'string' ||
    value.clientKey.trim().length === 0 ||
    value.clientKey.length > MAX_SOCKET_CLIENT_KEY_LENGTH ||
    typeof value.body !== 'string' ||
    value.body.length > MAX_SOCKET_BODY_LENGTH
  ) {
    return false;
  }
  const attachment = value.attachmentMetadata;
  return (
    attachment === undefined ||
    attachment === null ||
    (isRecord(attachment) && Object.keys(attachment).length <= 20)
  );
}

function isValidConversationJoin(
  value: unknown
): value is { conversationId: number; after?: number } {
  if (!isRecord(value) || !isConversationId(value.conversationId)) {
    return false;
  }
  return (
    value.after === undefined ||
    (Number.isSafeInteger(value.after) && (value.after as number) >= 0)
  );
}

function isValidConversationRead(
  value: unknown
): value is { conversationId: number; sequence: number } {
  return (
    isRecord(value) &&
    isConversationId(value.conversationId) &&
    Number.isSafeInteger(value.sequence) &&
    (value.sequence as number) >= 0
  );
}

function socketError(error: unknown) {
  logPublicError('Socket conversation operation failed', error);
  const response = publicErrorResponse(
    error,
    { status: 500, code: 'MessagingError', key: 'messaging.errors.failed' },
    {
      'messaging.errors.body_required': {
        status: 422,
        code: 'MessagingError',
        key: 'messaging.errors.body_required',
      },
      'messaging.errors.client_key_required': {
        status: 422,
        code: 'MessagingError',
        key: 'messaging.errors.client_key_required',
      },
      'messaging.errors.forbidden': {
        status: 403,
        code: 'MessagingError',
        key: 'messaging.errors.forbidden',
      },
      'messaging.errors.invalid_sequence': {
        status: 422,
        code: 'MessagingError',
        key: 'messaging.errors.invalid_sequence',
      },
      'messaging.errors.not_found': {
        status: 404,
        code: 'MessagingError',
        key: 'messaging.errors.not_found',
      },
    }
  );
  return { message: response.body.message };
}

const emitInvalidSocketPayload = (
  socket: Parameters<NonNullable<Parameters<Server['on']>[1]>>[0]
) => {
  socket.emit('conversation:error', {
    message: 'messaging.errors.invalid_payload',
  });
};

export function setupWebsocket(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  messageEvents.on('committed', (message) => {
    io.to(`conversation:${message.conversationId}`).emit(
      'conversation:message',
      {
        conversationId: message.conversationId,
        sequence: message.sequence,
        senderId: message.senderId,
        body: message.body,
        clientKey: message.clientKey,
        createdAt: message.createdAt.toISOString(),
        attachmentMetadata: message.attachmentMetadata,
      }
    );
  });
  agreementEvents.on('committed', (agreement: AgreementSnapshot) => {
    io.to(`conversation:${agreement.conversationId}`).emit(
      'agreement:updated',
      {
        agreementId: agreement.id,
        conversationId: agreement.conversationId,
        state: agreement.state,
        currentVersion: agreement.currentVersion,
      }
    );
  });

  io.use(async (socket, next) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next(new Error('auth.errors.unauthorized'));
    const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
    const token = parseCookies(socket.handshake.headers.cookie).sessionToken;
    if (!token) return next(new Error('auth.errors.unauthorized'));
    try {
      const payload = jwt.verify(token, jwtSecret, {
        algorithms: [jwtAlgorithm],
      }) as { id: number };
      const user = await findUserById(payload.id);
      if (!user) return next(new Error('auth.errors.unauthorized'));
      socket.data.user = { id: user.id, name: user.name };
      next();
    } catch (error) {
      logger.error('Socket authentication error', {
        message: error instanceof Error ? error.message : String(error),
      });
      next(new Error('auth.errors.unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('user', socket.data.user);
    void listConversations(socket.data.user.id)
      .then((conversations) => {
        conversations.forEach((conversation) => {
          void socket.join(`conversation:${conversation.id}`);
        });
      })
      .catch((error) => {
        logger.error('Socket conversation initialization failed', {
          userId: socket.data.user.id,
          message: error instanceof Error ? error.message : String(error),
        });
      });

    socket.on('conversation:join', async (payload, acknowledge) => {
      if (!isValidConversationJoin(payload)) {
        acknowledge?.(false);
        emitInvalidSocketPayload(socket);
        return;
      }
      const { conversationId, after } = payload;
      try {
        if (
          !(await isConversationParticipant(
            conversationId,
            socket.data.user.id
          ))
        ) {
          acknowledge?.(false);
          socket.emit('conversation:error', {
            message: 'messaging.errors.forbidden',
          });
          return;
        }
        const missed =
          after === undefined
            ? []
            : await listMessages(conversationId, socket.data.user.id, {
                after,
              });
        await socket.join(`conversation:${conversationId}`);
        missed.forEach((message) => {
          socket.emit('conversation:message', {
            conversationId: message.conversationId,
            sequence: message.sequence,
            senderId: message.senderId,
            body: message.body,
            clientKey: message.clientKey,
            createdAt: message.createdAt.toISOString(),
            attachmentMetadata: message.attachmentMetadata,
          });
        });
        acknowledge?.(true);
      } catch (error) {
        acknowledge?.(false);
        socket.emit('conversation:error', socketError(error));
      }
    });

    socket.on('conversation:message', async (payload) => {
      if (!isValidConversationMessage(payload)) {
        emitInvalidSocketPayload(socket);
        return;
      }
      try {
        if (
          !(await isConversationParticipant(
            payload.conversationId,
            socket.data.user.id
          ))
        ) {
          socket.emit('conversation:error', {
            message: 'messaging.errors.forbidden',
          });
          return;
        }
        const result = await sendMessageWithStatus({
          conversationId: payload.conversationId,
          senderId: socket.data.user.id,
          clientKey: payload.clientKey,
          body: payload.body,
          attachmentMetadata: payload.attachmentMetadata,
        });
        const message = result.message;
        if (!result.created) return;
        await notifyMessageRecipients({
          messageId: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
        });
        io.to(`conversation:${payload.conversationId}`).emit(
          'conversation:message',
          {
            conversationId: message.conversationId,
            sequence: message.sequence,
            senderId: message.senderId,
            body: message.body,
            clientKey: message.clientKey,
            createdAt: message.createdAt.toISOString(),
            attachmentMetadata: message.attachmentMetadata,
          }
        );
        const botId = await findBotIdForConversation(
          payload.conversationId,
          socket.data.user.id
        );
        if (botId) {
          // Keep the bot reply on the same persisted path as user messages;
          // emit only after the message is newly persisted.
          const reply = await generateReply(payload.body);
          const botResult = await sendMessageWithStatus({
            conversationId: payload.conversationId,
            senderId: botId,
            clientKey: `bot-reply-${message.id}`,
            body: reply,
          });
          const botMessage = botResult.message;
          if (!botResult.created) return;
          await notifyMessageRecipients({
            messageId: botMessage.id,
            conversationId: botMessage.conversationId,
            senderId: botMessage.senderId,
          });
          io.to(`conversation:${payload.conversationId}`).emit(
            'conversation:message',
            {
              conversationId: botMessage.conversationId,
              sequence: botMessage.sequence,
              senderId: botMessage.senderId,
              body: botMessage.body,
              clientKey: botMessage.clientKey,
              createdAt: botMessage.createdAt.toISOString(),
              attachmentMetadata: botMessage.attachmentMetadata,
            }
          );
        }
      } catch (error) {
        socket.emit('conversation:error', socketError(error));
      }
    });

    socket.on('conversation:read', async (payload) => {
      if (!isValidConversationRead(payload)) {
        emitInvalidSocketPayload(socket);
        return;
      }
      try {
        const { conversationId, sequence } = payload;
        if (
          !(await isConversationParticipant(
            conversationId,
            socket.data.user.id
          ))
        ) {
          socket.emit('conversation:error', {
            message: 'messaging.errors.forbidden',
          });
          return;
        }
        await markConversationRead(
          conversationId,
          socket.data.user.id,
          sequence
        );
        await markMessageNotificationsRead(conversationId, socket.data.user.id);
      } catch (error) {
        socket.emit('conversation:error', socketError(error));
      }
    });
  });
}
