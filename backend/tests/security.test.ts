import { afterEach, describe, expect, test, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { csrfProtection, getFrontendUrl } from '../src/security.js';

const originalNodeEnv = process.env.NODE_ENV;
const originalFrontendUrl = process.env.FRONTEND_URL;

afterEach(() => {
  vi.restoreAllMocks();
  process.env.NODE_ENV = originalNodeEnv;
  process.env.FRONTEND_URL = originalFrontendUrl;
});

describe('production browser security', () => {
  test('fails closed when production frontend origin is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.FRONTEND_URL;

    expect(() => getFrontendUrl()).toThrow(
      'FRONTEND_URL is required in production'
    );
  });

  test('rejects production frontend URLs that contain a path', () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://entrelibros.example/app';

    expect(() => getFrontendUrl()).toThrow(
      'FRONTEND_URL must be an HTTP(S) origin without a path'
    );
  });

  test('rejects a cross-origin mutation and accepts the configured origin', () => {
    process.env.NODE_ENV = 'production';
    const next = vi.fn<NextFunction>();
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();
    const response = { status, json } as unknown as Response;
    const request = {
      method: 'POST',
      get: vi.fn((header: string) =>
        header === 'origin' ? 'https://attacker.example' : undefined
      ),
    } as unknown as Request;

    csrfProtection('https://entrelibros.example', request, response, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'auth.errors.csrf_origin',
    });
    expect(next).not.toHaveBeenCalled();

    request.get = vi.fn(() => 'https://entrelibros.example');
    csrfProtection('https://entrelibros.example', request, response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
