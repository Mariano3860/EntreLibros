import { describe, expect, it } from 'vitest';
import { sum } from './math.js';

describe('sum', () => {
  it('adds numbers without touching DB', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
