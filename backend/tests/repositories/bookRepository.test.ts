import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import { pool, setTestClient } from '../../src/db.js';
import {
  createBook,
  listBooks,
  verifyBook,
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
  test('inserts and lists books with pending verification', async () => {
    await createBook({ title: 'Test Book', author: 'Author' });
    const books = await listBooks();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Test Book');
    expect(books[0].verified).toBe(false);
  });

  test('marks book as verified', async () => {
    const book = await createBook({ title: 'Another Book' });
    const verified = await verifyBook(book.id);
    expect(verified?.verified).toBe(true);
  });
});
