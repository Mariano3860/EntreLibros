import type { Response, NextFunction } from 'express';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  authenticate,
  type AuthenticatedRequest,
} from '../../src/middleware/auth.js';
import * as userRepository from '../../src/repositories/userRepository.js';
import type {
  PublicUser,
  User,
} from '../../src/repositories/userRepository.js';
import { logger } from '../../src/utils/logger.js';

describe('authenticate middleware', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalJwtAlgorithm = process.env.JWT_ALGORITHM;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.JWT_SECRET = 'secret';
    delete process.env.JWT_ALGORITHM;
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    if (originalJwtAlgorithm === undefined) {
      delete process.env.JWT_ALGORITHM;
    } else {
      process.env.JWT_ALGORITHM = originalJwtAlgorithm;
    }
  });

  function createResponseMock() {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
  }

  function createNextMock() {
    return vi.fn<Parameters<NextFunction>, void>();
  }

  test('returns 500 when JWT secret is not configured', async () => {
    delete process.env.JWT_SECRET;
    const req = { headers: {} } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = createNextMock();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'ServerError',
      message: 'auth.errors.jwt_not_configured',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when no session token is present', async () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = createNextMock();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  });

  test('logs error and returns 401 when token verification fails', async () => {
    const req = {
      headers: {
        cookie: 'sessionToken=' + encodeURIComponent('invalid token'),
      },
    } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = createNextMock();

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('boom');
    });
    const loggerSpy = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined);

    await authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid token', 'secret', {
      algorithms: ['HS256'],
    });
    expect(loggerSpy).toHaveBeenCalledWith('Authentication error', {
      message: 'boom',
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when user is not found', async () => {
    const req = {
      headers: { cookie: 'sessionToken=' + encodeURIComponent('valid-token') },
    } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = createNextMock();

    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 1 } as never);
    vi.spyOn(userRepository, 'findUserById').mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(userRepository.findUserById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches public user to request and calls next on success', async () => {
    const req = {
      headers: { cookie: 'sessionToken=' + encodeURIComponent('valid') },
    } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = createNextMock();

    const dbUser: User = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed',
      role: 'user',
      language: 'es',
      location: null,
      searchRadius: null,
    };
    const publicUser: PublicUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'user',
      language: 'es',
      location: null,
      searchRadius: null,
    };

    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 1 } as never);
    vi.spyOn(userRepository, 'findUserById').mockResolvedValue(dbUser);
    vi.spyOn(userRepository, 'toPublicUser').mockReturnValue(publicUser);

    await authenticate(req, res, next);

    expect(userRepository.findUserById).toHaveBeenCalledWith(1);
    expect(userRepository.toPublicUser).toHaveBeenCalledWith(dbUser);
    expect(req.user).toEqual(publicUser);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
