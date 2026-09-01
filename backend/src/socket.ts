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
import {
  agreementEvents,
  type AgreementSnapshot,
} from './repositories/agreementRepository.js';

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

export interface ChatMessage {
  text: string;
  user: ChatUser;
  timestamp: string;
  channel: string;
}

export interface ClientToServerEvents {
  message: (payload: { text: string; channel?: string }) => void;
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
  message: (msg: ChatMessage) => void;
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

    socket.on(
      'conversation:join',
      async ({ conversationId, after }, acknowledge) => {
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
        await socket.join(`conversation:${conversationId}`);
        if (after !== undefined) {
          const missed = await listMessages(
            conversationId,
            socket.data.user.id,
            {
              after,
            }
          );
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
        }
        acknowledge?.(true);
      }
    );

    socket.on('conversation:message', async (payload) => {
      try {
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
        socket.emit('conversation:error', {
          message:
            error instanceof Error ? error.message : 'messaging.errors.failed',
        });
      }
    });

    socket.on('conversation:read', async ({ conversationId, sequence }) => {
      if (
        !(await isConversationParticipant(conversationId, socket.data.user.id))
      ) {
        socket.emit('conversation:error', {
          message: 'messaging.errors.forbidden',
        });
        return;
      }
      try {
        await markConversationRead(
          conversationId,
          socket.data.user.id,
          sequence
        );
      } catch (error) {
        socket.emit('conversation:error', {
          message:
            error instanceof Error ? error.message : 'messaging.errors.failed',
        });
      }
    });

    socket.on('message', async ({ text, channel = 'general' }) => {
      const msg: ChatMessage = {
        text,
        user: socket.data.user,
        timestamp: new Date().toISOString(),
        channel,
      };
      io.emit('message', msg);
      if (channel === 'Bot' || /^@bot\b/i.test(text)) {
        const reply = await generateReply(text.replace(/^@bot\s*/i, ''));
        const botMsg: ChatMessage = {
          text: reply,
          user: { id: 0, name: 'Bot' },
          timestamp: new Date().toISOString(),
          channel,
        };
        io.emit('message', botMsg);
      }
    });
  });
}
