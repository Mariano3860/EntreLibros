import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../src/socket.js';
import Client from 'socket.io-client';
import type { AddressInfo } from 'net';
import { beforeAll, afterAll, describe, expect, test, vi } from 'vitest';
import app from '../src/app.js';
import { setupWebsocket } from '../src/socket.js';
import jwt, { type Algorithm } from 'jsonwebtoken';
import * as userRepo from '../src/repositories/userRepository.js';
import * as messagingRepo from '../src/repositories/messagingRepository.js';
import * as notificationService from '../src/services/notifications.js';

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
let httpServer: ReturnType<typeof createServer>;
let clientSocket: ReturnType<typeof Client>;

describe('chat bot replies', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    httpServer = createServer(app);
    io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer);
    setupWebsocket(io);
    await new Promise<void>((resolve) => httpServer.listen(() => resolve()));
    const address = httpServer.address() as AddressInfo;
    const port = address.port;
    vi.spyOn(userRepo, 'findUserById').mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 't@example.com',
      password: '',
      role: 'user',
      language: 'en',
      location: null,
      searchRadius: null,
    });
    vi.spyOn(messagingRepo, 'listConversations').mockResolvedValue([]);
    vi.spyOn(notificationService, 'notifyMessageRecipients').mockResolvedValue(
      undefined
    );
    const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!, {
      algorithm: jwtAlgorithm,
    });
    const options = {
      extraHeaders: { cookie: `sessionToken=${token}` },
    } as unknown as Parameters<typeof Client>[0];
    clientSocket = Client(`http://localhost:${port}`, options);
    await new Promise<void>((resolve) =>
      clientSocket.on('connect', () => resolve())
    );
  });

  afterAll(() => {
    clientSocket.close();
    io.close();
    httpServer.close();
  });

  test('persists and emits the bot reply through the conversation protocol', async () => {
    vi.spyOn(messagingRepo, 'isConversationParticipant').mockResolvedValue(
      true
    );
    vi.spyOn(messagingRepo, 'findBotIdForConversation').mockResolvedValue(2);
    const sendMessageWithStatus = vi
      .spyOn(messagingRepo, 'sendMessageWithStatus')
      .mockImplementation(async (input) => ({
        message: {
          id: input.senderId === 1 ? 10 : 11,
          conversationId: input.conversationId,
          senderId: input.senderId,
          sequence: input.senderId === 1 ? 1 : 2,
          clientKey: input.clientKey,
          body: input.body.trim(),
          attachmentMetadata: input.attachmentMetadata ?? null,
          createdAt: new Date(),
        },
        created: true,
      }));

    await new Promise<void>((resolve, reject) => {
      clientSocket.emit(
        'conversation:join',
        { conversationId: 42 },
        (joined) =>
          joined ? resolve() : reject(new Error('conversation join rejected'))
      );
    });

    const received: Array<{
      senderId: number;
      body: string;
      conversationId: number;
    }> = [];
    const messagesReceived = new Promise<void>((resolve) => {
      const onMessage = (message: (typeof received)[number]) => {
        received.push(message);
        if (received.length === 2) {
          clientSocket.off('conversation:message', onMessage);
          resolve();
        }
      };
      clientSocket.on('conversation:message', onMessage);
    });

    clientSocket.emit('conversation:message', {
      conversationId: 42,
      clientKey: 'user-message-1',
      body: 'hola',
    });
    await messagesReceived;

    expect(received).toHaveLength(2);
    expect(received[0]).toMatchObject({
      conversationId: 42,
      senderId: 1,
      body: 'hola',
    });
    expect(received[1]).toMatchObject({
      conversationId: 42,
      senderId: 2,
      body: expect.stringContaining('Hola'),
    });
    expect(sendMessageWithStatus).toHaveBeenCalledTimes(2);
    expect(sendMessageWithStatus).toHaveBeenNthCalledWith(1, {
      conversationId: 42,
      senderId: 1,
      clientKey: 'user-message-1',
      body: 'hola',
      attachmentMetadata: undefined,
    });
    expect(sendMessageWithStatus).toHaveBeenNthCalledWith(2, {
      conversationId: 42,
      senderId: 2,
      clientKey: 'bot-reply-10',
      body: expect.stringContaining('Hola'),
    });
  });
});
