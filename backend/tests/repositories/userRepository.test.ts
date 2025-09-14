import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserLanguage,
  updateUserLocation,
} from '../../src/repositories/userRepository.js';
import {
  DEFAULT_USER_ROLE,
  DEFAULT_USER_LANGUAGE,
} from '../../src/constants.js';

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
    expect(found?.language).toBe(DEFAULT_USER_LANGUAGE);
  });

  test('updates user language', async () => {
    const user = await createUser(
      'Bob',
      'bob@example.com',
      'secret',
      DEFAULT_USER_ROLE
    );
    await updateUserLanguage(user.id, 'en');
    const updated = await findUserById(user.id);
    expect(updated?.language).toBe('en');
  });

  test('updates user location and search radius', async () => {
    const user = await createUser(
      'Carol',
      'carol@example.com',
      'secret',
      DEFAULT_USER_ROLE
    );
    await updateUserLocation(user.id, -3.7038, 40.4168, 1000);
    const updated = await findUserById(user.id);
    expect(updated?.location).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
    });
    expect(updated?.searchRadius).toBe(1000);
  });
});
