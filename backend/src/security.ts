import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEVELOPMENT_FRONTEND_URL = 'http://localhost:3000';

/**
 * Returns the only browser origin allowed to use the API.
 * Production deliberately has no fallback: an omitted URL must stop startup
 * instead of silently trusting an unintended origin.
 */
export function getFrontendUrl(): string {
  const configured = process.env.FRONTEND_URL?.trim();
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL is required in production');
  }

  const value = configured || DEVELOPMENT_FRONTEND_URL;
  const parsed = new URL(value);
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.pathname !== '/'
  ) {
    throw new Error('FRONTEND_URL must be an HTTP(S) origin without a path');
  }
  return parsed.origin;
}

/**
 * Same-origin browser requests include Origin for JSON mutations. Requiring
 * that exact origin in production blocks cross-site state changes while
 * leaving read-only requests and local development unchanged.
 */
export function csrfProtection(
  frontendUrl: string,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV !== 'production' || SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  if (req.get('origin') !== frontendUrl) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'auth.errors.csrf_origin',
    });
    return;
  }

  next();
}
