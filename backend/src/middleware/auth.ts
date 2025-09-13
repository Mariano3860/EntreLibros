import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  findUserById,
  toPublicUser,
  type PublicUser,
} from '../repositories/userRepository.js';

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
    const payload = jwt.verify(token, jwtSecret) as { id: number };
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
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
}
