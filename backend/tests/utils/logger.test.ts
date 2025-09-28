import { describe, expect, test, vi } from 'vitest';
import { logger } from '../../src/utils/logger.js';

describe('logger utility', () => {
  test('logs info messages with and without metadata', () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    logger.info('simple message');
    logger.info('message with meta', { key: 'value' });

    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'simple message');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 'message with meta', {
      key: 'value',
    });

    consoleSpy.mockRestore();
  });

  test('logs error messages with and without metadata', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    logger.error('error occurred');
    logger.error('error with details', { code: 500 });

    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'error occurred');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 'error with details', {
      code: 500,
    });

    consoleSpy.mockRestore();
  });
});
