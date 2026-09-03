import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import { pool, setTestClient } from '../../src/db.js';
import {
  normalizePersonSearchTerm,
  searchPeople,
} from '../../src/repositories/personSearchRepository.js';

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

describe('personSearchRepository', () => {
  test('normalizes accents and orders exact, prefix and contains matches', async () => {
    const viewer = await client.query<{ id: number }>(
      `INSERT INTO users (name, alias, email, password, role)
       VALUES ('Viewer', 'viewer', 'person-search-viewer@example.com', 'hash', 'user')
       RETURNING id`
    );
    const exact = await client.query<{ id: number }>(
      `INSERT INTO users (name, alias, email, password, role)
       VALUES ('Maria', 'maria', 'maria@example.com', 'hash', 'user')
       RETURNING id`
    );
    const prefix = await client.query<{ id: number }>(
      `INSERT INTO users (name, alias, email, password, role)
       VALUES ('Mariana', 'mariana', 'mariana@example.com', 'hash', 'user')
       RETURNING id`
    );
    await client.query(
      `INSERT INTO users (name, alias, email, password, role)
       VALUES ('Ana María', 'lectora-maria', 'ana.maria@example.com', 'hash', 'user')`
    );

    expect(normalizePersonSearchTerm('  MÁRIA ')).toBe('maria');
    const results = await searchPeople(viewer.rows[0].id, 'maria');
    expect(results.slice(0, 2).map((person) => person.id)).toEqual([
      exact.rows[0].id,
      prefix.rows[0].id,
    ]);
    expect((await searchPeople(viewer.rows[0].id, '@maria'))[0]?.id).toBe(
      exact.rows[0].id
    );
    expect(
      results.every((person) =>
        Object.keys(person).every((key) =>
          [
            'id',
            'name',
            'alias',
            'profilePhoto',
            'booksCount',
            'exchangeCount',
            'isFollowing',
          ].includes(key)
        )
      )
    ).toBe(true);
  });

  test('caps results at twenty and returns follow state from the viewer', async () => {
    const viewer = await client.query<{ id: number }>(
      `INSERT INTO users (name, alias, email, password, role)
       VALUES ('Limit Viewer', 'limit-viewer', 'person-search-limit@example.com', 'hash', 'user')
       RETURNING id`
    );
    const ids: number[] = [];
    for (let index = 1; index <= 21; index += 1) {
      const result = await client.query<{ id: number }>(
        `INSERT INTO users (name, alias, email, password, role)
         VALUES ($1, $2, $3, 'hash', 'user')
         RETURNING id`,
        [`Reader ${index}`, `reader-${index}`, `reader-${index}@example.com`]
      );
      ids.push(result.rows[0].id);
    }
    await client.query(
      'INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2)',
      [viewer.rows[0].id, ids[0]]
    );

    const results = await searchPeople(viewer.rows[0].id, 'reader');
    expect(results).toHaveLength(20);
    expect(results[0]).toMatchObject({ id: ids[0], isFollowing: true });
    expect(results.map((person) => person.name)).toEqual(
      Array.from({ length: 21 }, (_, index) => `Reader ${index + 1}`)
        .sort((left, right) => left.localeCompare(right))
        .slice(0, 20)
    );
  });
});
