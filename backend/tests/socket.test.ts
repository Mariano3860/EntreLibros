import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { beforeAll, afterAll, describe, expect, test, vi } from 'vitest';
import app from '../src/app.js';
import { setupWebsocket } from '../src/socket.js';
import jwt from 'jsonwebtoken';
import * as userRepo from '../src/repositories/userRepository.js';

let io: Server;
let httpServer: ReturnType<typeof createServer>;
let clientSocket: ReturnType<typeof Client>;

describe('websocket messaging', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    httpServer = createServer(app);
    io = new Server(httpServer);
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
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!);
    clientSocket = Client(`http://localhost:${port}`, {
      extraHeaders: { cookie: `sessionToken=${token}` },
    });
    await new Promise<void>((resolve) =>
      clientSocket.on('connect', () => resolve())
    );
  });

  afterAll(() => {
    clientSocket.close();
    io.close();
    httpServer.close();
  });

  test('broadcasts messages', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('message', (msg) => {
        expect(msg.text).toBe('hello');
        expect(msg.user.id).toBe(1);
        resolve();
      });
      clientSocket.emit('message', 'hello');
    });
  });
});
