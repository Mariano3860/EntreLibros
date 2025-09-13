import type { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  findUserById,
  toPublicUser,
  type PublicUser,
} from './repositories/userRepository.js';
import { logger } from './utils/logger.js';

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.trim().split('=');
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export interface ChatMessage {
  text: string;
  user: PublicUser;
}

export function setupWebsocket(io: Server) {
  io.use(async (socket, next) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next(new Error('Unauthorized'));
    const token = parseCookies(socket.handshake.headers.cookie).sessionToken;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = jwt.verify(token, jwtSecret) as { id: number };
      const user = await findUserById(payload.id);
      if (!user) return next(new Error('Unauthorized'));
      (socket as any).user = toPublicUser(user);
      next();
    } catch (error) {
      logger.error('Socket authentication error', {
        message: error instanceof Error ? error.message : String(error),
      });
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('message', (text: string) => {
      const user: PublicUser = (socket as any).user;
      const msg: ChatMessage = { text, user };
      io.emit('message', msg);
    });
  });
}
