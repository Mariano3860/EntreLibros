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
import { agreementEvents } from '../src/repositories/agreementRepository.js';

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
    vi.spyOn(messagingRepo, 'listMessages').mockResolvedValue([
      {
        id: 2,
        conversationId: 101,
        senderId: 1,
        sequence: 2,
        clientKey: 'missed-2',
        body: 'missed',
        attachmentMetadata: null,
        createdAt: new Date(),
      },
    ]);

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

    const synced = new Promise<void>((resolve) => {
      authorized.once('conversation:message', (message) => {
        expect(message.sequence).toBe(2);
        expect(message.body).toBe('missed');
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      authorized.emit(
        'conversation:join',
        { conversationId: 101, after: 1 },
        (joined) =>
          joined ? resolve() : reject(new Error('authorized join rejected'))
      );
    });
    await synced;
    const received = new Promise<void>((resolve) => {
      authorized.once('conversation:message', (message) => {
        expect(message.body).toBe('private');
        expect(message.conversationId).toBe(101);
        expect(Object.keys(message).sort()).toEqual([
          'attachmentMetadata',
          'body',
          'clientKey',
          'conversationId',
          'createdAt',
          'senderId',
          'sequence',
        ]);
        expect(message.attachmentMetadata).toEqual(
          expect.objectContaining({ kind: 'book', bookId: '1' })
        );
        resolve();
      });
    });
    let outsiderReceived = false;
    const agreementReceived = new Promise<void>((resolve) => {
      authorized.once('agreement:updated', (update) => {
        expect(update.agreementId).toBe(7);
        expect(update.currentVersion).toBe(2);
        resolve();
      });
    });
    let outsiderAgreementReceived = false;
    outsider.once('agreement:updated', () => {
      outsiderAgreementReceived = true;
    });
    outsider.once('conversation:message', () => {
      outsiderReceived = true;
    });
    await new Promise<void>((resolve, reject) => {
      outsider.emit('conversation:join', { conversationId: 202 }, (joined) =>
        joined ? resolve() : reject(new Error('second room join rejected'))
      );
    });
    await new Promise<void>((resolve, reject) => {
      clientSocket.emit(
        'conversation:join',
        { conversationId: 101 },
        (joined) =>
          joined ? resolve() : reject(new Error('first room join rejected'))
      );
    });
    agreementEvents.emit('committed', {
      id: 7,
      conversationId: 101,
      proposerId: 1,
      participantId: 2,
      state: 'partially_confirmed',
      currentVersion: 2,
      details: {
        meetingPoint: 'Library',
        area: 'Center',
        date: '2026-09-01',
        time: '18:00',
        bookTitle: 'Dune',
      },
      acceptances: [1],
      listingIds: [],
    });
    await agreementReceived;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(outsiderAgreementReceived).toBe(false);
    messagingRepo.publishMessage({
      id: 1,
      conversationId: 101,
      senderId: 1,
      sequence: 1,
      clientKey: 'room-key',
      body: 'private',
      attachmentMetadata: {
        key: 'book:1',
        contentType: 'application/x-entrelibros-book',
        size: 1,
        kind: 'book',
        bookId: '1',
        title: 'Libro privado',
        author: 'Autora',
        coverUrl: '/cover.jpg',
      },
      createdAt: new Date(),
    });
    await received;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(outsiderReceived).toBe(false);
    authorized.close();
    outsider.close();
  }, 10000);

  test('rejects invalid read payloads and hides unexpected messaging errors', async () => {
    const invalidPayload = new Promise<void>((resolve) => {
      clientSocket.once('conversation:error', (payload) => {
        expect(payload.message).toBe('messaging.errors.invalid_payload');
        resolve();
      });
    });
    clientSocket.emit('conversation:read', {
      conversationId: 101,
      sequence: -1,
    });
    await invalidPayload;

    vi.spyOn(messagingRepo, 'isConversationParticipant').mockResolvedValue(
      true
    );
    vi.spyOn(messagingRepo, 'markConversationRead').mockRejectedValueOnce(
      new Error('SQL connection details')
    );
    const unexpectedFailure = new Promise<void>((resolve) => {
      clientSocket.once('conversation:error', (payload) => {
        expect(payload.message).toBe('messaging.errors.failed');
        expect(payload.message).not.toContain('SQL connection details');
        resolve();
      });
    });
    clientSocket.emit('conversation:read', {
      conversationId: 101,
      sequence: 1,
    });
    await unexpectedFailure;
  });

  test('authorizes delivered acknowledgements and broadcasts them to the room', async () => {
    const delivered = vi
      .spyOn(messagingRepo, 'markConversationDelivered')
      .mockResolvedValueOnce(true);
    const status = new Promise<void>((resolve) => {
      clientSocket.once('conversation:delivered', (payload) => {
        expect(payload).toEqual({
          conversationId: 101,
          sequence: 2,
          userId: 1,
        });
        resolve();
      });
    });
    const acknowledged = new Promise<boolean>((resolve) => {
      clientSocket.emit(
        'conversation:delivered',
        { conversationId: 101, sequence: 2 },
        resolve
      );
    });

    await expect(acknowledged).resolves.toBe(true);
    await status;
    expect(delivered).toHaveBeenCalledWith(101, 1, 2);

    const invalidPayload = new Promise<void>((resolve) => {
      clientSocket.once('conversation:error', (payload) => {
        expect(payload.message).toBe('messaging.errors.invalid_payload');
        resolve();
      });
    });
    clientSocket.emit('conversation:delivered', {
      conversationId: 101,
      sequence: -1,
    });
    await invalidPayload;
  });
});
