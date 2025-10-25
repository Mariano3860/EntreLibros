import type { Server } from 'socket.io';
import jwt, { type Algorithm } from 'jsonwebtoken';
import { findUserById } from './repositories/userRepository.js';
import { logger } from './utils/logger.js';
import { generateReply } from './services/chatBot.js';

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
}

export interface ServerToClientEvents {
  message: (msg: ChatMessage) => void;
  user: (user: ChatUser) => void;
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
