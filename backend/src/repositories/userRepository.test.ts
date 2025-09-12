import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { pool, setTestClient } from '../db.js';
import type { PoolClient } from 'pg';
import { createUser, findUserByEmail } from './userRepository.js';

let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
});

describe('userRepository', () => {
  it('creates and finds users', async () => {
    await createUser('Alice', 'alice@example.com', 'secret');
    const found = await findUserByEmail('alice@example.com');
    expect(found?.email).toBe('alice@example.com');
  });
});
