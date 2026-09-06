import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { logger } from './logger.js';

export type PublicErrorDefinition = {
  status: number;
  code: string;
  key: string;
};

export type PublicErrorMap = Record<string, PublicErrorDefinition>;

const INTERNAL_ERROR: PublicErrorDefinition = {
  status: 500,
  code: 'InternalServerError',
  key: 'errors.internal',
};

export function classifyPublicError(
  error: unknown,
  fallback: PublicErrorDefinition,
  knownErrors: PublicErrorMap = {}
): PublicErrorDefinition {
  const message = error instanceof Error ? error.message : undefined;
  return (message && knownErrors[message]) || fallback;
}

export function publicErrorResponse(
  error: unknown,
  fallback: PublicErrorDefinition,
  knownErrors: PublicErrorMap = {}
) {
  const definition = classifyPublicError(error, fallback, knownErrors);
  return {
    status: definition.status,
    body: { error: definition.code, message: definition.key },
  };
}

export function logPublicError(
  context: string,
  error: unknown,
  meta: Record<string, unknown> = {}
) {
  logger.error(context, {
    ...meta,
    error: error instanceof Error ? error.message : 'unknown error',
  });
}

export function asyncHandler<TRequest extends Request>(
  handler: (
    req: TRequest,
    res: Response,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req as TRequest, res, next)).catch(next);
  };
}

export const publicErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  logPublicError('Unhandled request error', error, {
    method: req.method,
    path: req.path,
  });
  res.status(INTERNAL_ERROR.status).json({
    error: INTERNAL_ERROR.code,
    message: INTERNAL_ERROR.key,
  });
};
