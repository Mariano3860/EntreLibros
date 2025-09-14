import type { Request, Response, NextFunction } from 'express';
import jwt, { type Algorithm } from 'jsonwebtoken';
import {
  findUserById,
  toPublicUser,
  type PublicUser,
} from '../repositories/userRepository.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: PublicUser;
}

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.trim().split('=');
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
  if (!jwtSecret) {
    return res.status(500).json({
      error: 'ServerError',
      message: 'auth.errors.jwt_not_configured',
    });
  }

  const token = parseCookies(req.headers.cookie).sessionToken;
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: [jwtAlgorithm],
    }) as { id: number };
    const user = await findUserById(payload.id);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    req.user = toPublicUser(user);
    next();
  } catch (error) {
    logger.error('Authentication error', {
      message: error instanceof Error ? error.message : String(error),
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
}
