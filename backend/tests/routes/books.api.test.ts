import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import type { PoolClient } from 'pg';
import * as openLibrary from '../../src/services/openLibrary.js';

let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
  vi.spyOn(openLibrary, 'checkBookExists').mockResolvedValue(false);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
  vi.restoreAllMocks();
});

describe('books API legacy endpoints', () => {
  test('requires q for search', async () => {
    const res = await request(app).get('/api/books/search').expect(400);
    expect(res.body).toEqual({
      error: 'q_required',
      message: 'Missing q (or query) parameter',
    });
  });

  test('returns search error when OpenLibrary fails', async () => {
    vi.spyOn(openLibrary, 'searchBooksApiResults').mockRejectedValueOnce(
      new Error('fail')
    );

    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'foo' })
      .expect(502);

    expect(res.body).toEqual({
      error: 'openlibrary_error: Error: fail',
    });
  });

  test('returns array of ApiBookSearchResult on success', async () => {
    const payload = [
      {
        id: 'OL9999M',
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        publisher: 'DAW',
        year: 2007,
        language: 'spa',
        isbn: '9788401337208',
        coverUrl: 'https://covers.openlibrary.org/b/id/321-M.jpg',
      },
      {
        id: 'OL8888M',
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        publisher: 'DAW',
        year: 2007,
        language: 'eng',
        isbn: '9780756404741',
        coverUrl: 'https://covers.openlibrary.org/b/id/322-M.jpg',
      },
    ];

    vi.spyOn(openLibrary, 'searchBooksApiResults').mockResolvedValueOnce(
      payload
    );

    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'el nombre del viento' })
      .expect(200);

    expect(res.body).toEqual(payload);
  });

  test('returns not found when verifying missing book', async () => {
    const res = await request(app).post('/api/books/123/verify').expect(404);
    expect(res.body).toEqual({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  });
});
