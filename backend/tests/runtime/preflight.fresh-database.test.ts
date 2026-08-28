import { describe, expect, test, vi } from 'vitest';

const { end, query, Client } = vi.hoisted(() => {
  const connect = vi
    .fn()
    .mockRejectedValueOnce(
      Object.assign(new Error('database does not exist'), { code: '3D000' })
    )
    .mockResolvedValueOnce(undefined);
  const end = vi.fn().mockResolvedValue(undefined);
  const query = vi.fn().mockResolvedValue({
    rows: [{ default_version: '3.4.3', installed_version: null }],
  });
  const Client = vi.fn(() => ({ connect, end, query }));

  return { end, query, Client };
});

vi.mock('pg', () => ({ default: { Client } }));

import { verifyPostgresPreflight } from '../../scripts/preflight.js';

describe('PostgreSQL preflight on a fresh database', () => {
  test('checks the maintenance database before migrations create the target', async () => {
    await expect(
      verifyPostgresPreflight(
        'postgres://postgres:postgres@localhost:5432/entrelibros'
      )
    ).resolves.toBe(true);

    expect(Client).toHaveBeenCalledTimes(2);
    expect(Client.mock.calls[1][0].connectionString).toContain('/postgres');
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalledWith(
      'CREATE EXTENSION IF NOT EXISTS postgis;'
    );
    expect(end).toHaveBeenCalledTimes(2);
  });
});
