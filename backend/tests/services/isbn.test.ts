import { describe, expect, test } from 'vitest';

import { normalizeIsbn } from '../../src/services/isbn.js';

describe('ISBN normalization', () => {
  test('accepts ISBN-10 with separators and normalizes its check digit', () => {
    expect(normalizeIsbn('0-306-40615-2')).toBe('0306406152');
    expect(normalizeIsbn('0-8044-2957-X')).toBe('080442957X');
  });

  test('accepts valid ISBN-13 and removes separators', () => {
    expect(normalizeIsbn('978-0-14-032872-1')).toBe('9780140328721');
  });

  test('rejects invalid or unsupported ISBN values', () => {
    expect(normalizeIsbn('9780000000001')).toBeNull();
    expect(normalizeIsbn('123456789')).toBeNull();
    expect(normalizeIsbn('')).toBeNull();
  });
});
