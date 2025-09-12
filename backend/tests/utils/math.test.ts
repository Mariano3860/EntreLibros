import { describe, expect, test } from 'vitest';
import { sum } from '../../src/utils/math.js';

describe('sum', () => {
  test('adds numbers without touching DB', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
