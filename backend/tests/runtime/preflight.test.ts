import { describe, expect, test } from 'vitest';
import { verifyPostgresPreflight } from '../../scripts/preflight.js';

describe('PostgreSQL/PostGIS Preflight Check', () => {
  test('throws an actionable error when DATABASE_URL is missing or invalid', async () => {
    await expect(verifyPostgresPreflight(undefined)).rejects.toThrow(
      'DATABASE_URL environment variable is required'
    );
    await expect(verifyPostgresPreflight('invalid-url')).rejects.toThrow(
      'Invalid DATABASE_URL format'
    );
  });

  test('throws actionable error on unreachable host/port', async () => {
    // Port 59999 is likely unreachable
    const unreachableUrl =
      'postgres://postgres:postgres@localhost:59999/entrelibros';
    await expect(verifyPostgresPreflight(unreachableUrl)).rejects.toThrow(
      'Failed to connect to PostgreSQL'
    );
  });
});
