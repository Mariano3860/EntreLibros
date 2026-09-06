import { describe, expect, test, vi } from 'vitest';
import {
  asyncHandler,
  logPublicError,
  publicErrorResponse,
} from '../../src/utils/publicErrors.js';
import { logger } from '../../src/utils/logger.js';

describe('public error boundary', () => {
  test('keeps known domain errors and normalizes unexpected errors', () => {
    const known = publicErrorResponse(
      new Error('domain.forbidden'),
      { status: 500, code: 'InternalError', key: 'errors.internal' },
      {
        'domain.forbidden': {
          status: 403,
          code: 'Forbidden',
          key: 'domain.forbidden',
        },
      }
    );
    const unexpected = publicErrorResponse(
      new Error('SELECT * FROM users -- private'),
      { status: 500, code: 'InternalError', key: 'errors.internal' }
    );

    expect(known).toEqual({
      status: 403,
      body: { error: 'Forbidden', message: 'domain.forbidden' },
    });
    expect(unexpected).toEqual({
      status: 500,
      body: { error: 'InternalError', message: 'errors.internal' },
    });
    expect(JSON.stringify(unexpected)).not.toContain('SELECT');
  });

  test('delegates rejected handlers to next without leaving a promise open', async () => {
    const next = vi.fn();
    const handler = asyncHandler(async () => {
      throw new Error('database credentials');
    });

    handler({} as never, {} as never, next);
    await vi.waitFor(() =>
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    );
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      message: 'database credentials',
    });
  });

  test('logs private details through the server logger', () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

    logPublicError('private operation', new Error('SQL details'), {
      requestId: 'request-1',
    });

    expect(error).toHaveBeenCalledWith(
      'private operation',
      expect.objectContaining({ error: 'SQL details', requestId: 'request-1' })
    );
    error.mockRestore();
  });
});
