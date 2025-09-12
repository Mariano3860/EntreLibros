import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  DEFAULT_USER_ROLE,
} from '../../src/repositories/userRepository.js';

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
  test('creates and finds users', async () => {
    const user = await createUser(
      'Alice',
      'alice@example.com',
      'secret',
      DEFAULT_USER_ROLE
    );
    expect(await bcrypt.compare('secret', user.password)).toBe(true);
    const found = await findUserByEmail('alice@example.com');
    expect(found?.email).toBe('alice@example.com');
  });
});
