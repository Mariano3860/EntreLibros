import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../src/socket.js';
import Client from 'socket.io-client';
import { beforeAll, afterAll, describe, expect, test, vi } from 'vitest';
import app from '../src/app.js';
import { setupWebsocket } from '../src/socket.js';
import jwt, { type Algorithm } from 'jsonwebtoken';
import * as userRepo from '../src/repositories/userRepository.js';

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
    const port = (httpServer.address() as any).port;
    vi.spyOn(userRepo, 'findUserById').mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 't@example.com',
      password: '',
      role: 'user',
      language: 'en',
    });
    const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!, {
      algorithm: jwtAlgorithm,
    });
    clientSocket = Client(`http://localhost:${port}`, {
      extraHeaders: { cookie: `sessionToken=${token}` } as any,
    } as any);
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
      clientSocket.on('message', (msg: any) => {
        expect(msg.text).toBe('hello');
        expect(msg.user).toEqual({ id: 1, name: 'Test' });
        expect(msg.timestamp).toBeTruthy();
        expect(msg.channel).toBe('general');
        expect((msg.user as any).email).toBeUndefined();
        resolve();
      });
      clientSocket.emit('message', { text: 'hello', channel: 'general' });
    });
  });
});
