import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { pool, setTestClient } from '../../src/db.js';
import {
  createBook,
  listBooks,
  verifyBook,
  searchBooks,
} from '../../src/repositories/bookRepository.js';
import type { PoolClient } from 'pg';

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

describe('bookRepository', () => {
  test('inserts, verifies and searches books', async () => {
    const created = await createBook({ title: 'Test Book', author: 'Tester' });
    expect(created.verified).toBe(false);
    let books = await listBooks();
    expect(books).toHaveLength(0);
    await verifyBook(created.id);
    books = await listBooks();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Test Book');
    const found = await searchBooks('Test');
    expect(found).toHaveLength(1);
  });
});
