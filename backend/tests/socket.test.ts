import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ChatMessage,
} from '../src/socket.js';
import Client from 'socket.io-client';
import type { AddressInfo } from 'net';
import { beforeAll, afterAll, describe, expect, test, vi } from 'vitest';
import app from '../src/app.js';
import { setupWebsocket } from '../src/socket.js';
import jwt, { type Algorithm } from 'jsonwebtoken';
import * as userRepo from '../src/repositories/userRepository.js';
import * as messagingRepo from '../src/repositories/messagingRepository.js';

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
let httpServer: ReturnType<typeof createServer>;
let clientSocket: ReturnType<typeof Client>;

describe('websocket messaging', () => {
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

  test('broadcasts messages without exposing sensitive data', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('message', (msg: ChatMessage) => {
        expect(msg.text).toBe('hello');
        expect(msg.user).toEqual({ id: 1, name: 'Test' });
        expect(msg.timestamp).toBeTruthy();
        expect(msg.channel).toBe('general');
        expect('email' in msg.user).toBe(false);
        resolve();
      });
      clientSocket.emit('message', { text: 'hello', channel: 'general' });
    });
  });

  test('delivers persisted messages only to authorized conversation rooms', async () => {
    const memberships = new Map([
      ['101:1', true],
      ['101:2', true],
      ['202:3', true],
    ]);
    vi.spyOn(messagingRepo, 'listConversations').mockResolvedValue([]);
    vi.spyOn(messagingRepo, 'isConversationParticipant').mockImplementation(
      async (conversationId, userId) =>
        memberships.get(`${conversationId}:${userId}`) ?? false
    );
    vi.spyOn(messagingRepo, 'sendMessage').mockResolvedValue({
      id: 1,
      conversationId: 101,
      senderId: 1,
      sequence: 1,
      clientKey: 'room-key',
      body: 'private',
      attachmentMetadata: null,
      createdAt: new Date(),
    });

    const address = httpServer.address() as AddressInfo;
    const tokenFor = (id: number) =>
      jwt.sign({ id }, process.env.JWT_SECRET!, { algorithm: 'HS256' });
    vi.mocked(userRepo.findUserById).mockImplementation(async (id) => ({
      id,
      name: `User ${id}`,
      email: `user-${id}@example.com`,
      password: '',
      role: 'user',
      language: 'en',
      location: null,
      searchRadius: null,
    }));

    const authorized = Client(`http://localhost:${address.port}`, {
      extraHeaders: { cookie: `sessionToken=${tokenFor(2)}` },
    });
    const outsider = Client(`http://localhost:${address.port}`, {
      extraHeaders: { cookie: `sessionToken=${tokenFor(3)}` },
    });
    await Promise.all([
      new Promise<void>((resolve) => authorized.on('connect', () => resolve())),
      new Promise<void>((resolve) => outsider.on('connect', () => resolve())),
    ]);

    authorized.emit('conversation:join', { conversationId: 101 });
    const received = new Promise<void>((resolve) => {
      authorized.once('conversation:message', (message) => {
        expect(message.body).toBe('private');
        expect(message.conversationId).toBe(101);
        resolve();
      });
    });
    let outsiderReceived = false;
    outsider.once('conversation:message', () => {
      outsiderReceived = true;
    });
    clientSocket.emit('conversation:join', { conversationId: 101 });
    await new Promise((resolve) => setTimeout(resolve, 30));
    clientSocket.emit('conversation:message', {
      conversationId: 101,
      clientKey: 'room-key',
      body: 'private',
    });
    await received;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(outsiderReceived).toBe(false);
    authorized.close();
    outsider.close();
  });
});
