import { describe, expect, test } from 'vitest';

import { parseTestDatabaseUrl } from '../../scripts/test-database.js';

describe('backend test database guard', () => {
  test('accepts a PostgreSQL database explicitly named for tests', () => {
    expect(
      parseTestDatabaseUrl(
        'postgres://postgres:postgres@localhost:5432/entrelibros_test'
      ).databaseName
    ).toBe('entrelibros_test');
  });

  test('rejects malformed, non-PostgreSQL and non-test targets', () => {
    expect(() => parseTestDatabaseUrl(undefined)).toThrow('required');
    expect(() => parseTestDatabaseUrl('not a URL')).toThrow('valid PostgreSQL');
    expect(() => parseTestDatabaseUrl('https://example.com/test')).toThrow(
      'postgres protocol'
    );
    expect(() =>
      parseTestDatabaseUrl(
        'postgres://postgres:postgres@localhost:5432/entrelibros'
      )
    ).toThrow('Refusing to reset a non-test database');
  });
});
