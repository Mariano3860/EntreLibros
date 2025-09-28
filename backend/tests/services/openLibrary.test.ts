import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  searchBooks,
  checkBookExists,
} from '../../src/services/openLibrary.js';

describe('openLibrary service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('searchBooks maps Open Library documents to domain books', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        docs: [
          {
            title: 'Test Title',
            author_name: ['Author One', 'Author Two'],
            isbn: ['1234567890'],
            publisher: ['Publisher Inc.'],
            first_publish_year: 1999,
          },
        ],
      }),
    } as unknown as Response);

    const books = await searchBooks('test query');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?q=test%20query&limit=10'
    );
    expect(books).toEqual([
      {
        title: 'Test Title',
        author: 'Author One',
        isbn: '1234567890',
        publisher: 'Publisher Inc.',
        publishedYear: 1999,
      },
    ]);
  });

  test('searchBooks defaults missing document fields to null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        docs: [
          {
            title: 'Untitled',
          },
        ],
      }),
    } as unknown as Response);

    const books = await searchBooks('missing fields');
    expect(books).toEqual([
      {
        title: 'Untitled',
        author: null,
        isbn: null,
        publisher: null,
        publishedYear: null,
      },
    ]);
  });

  test('checkBookExists uses ISBN when provided', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: async () => ({ numFound: 1 }),
    });

    const exists = await checkBookExists(
      { isbn: '9780140328721' },
      { fetchFn }
    );

    expect(fetchFn).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?q=isbn%3A9780140328721&limit=1'
    );
    expect(exists).toBe(true);
  });

  test('checkBookExists builds query from title and author when ISBN missing', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: async () => ({ numFound: 0 }),
    });

    const exists = await checkBookExists(
      { title: 'Cien años de soledad', author: 'Gabriel García Márquez' },
      { fetchFn }
    );

    expect(fetchFn).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?q=Cien%20a%C3%B1os%20de%20soledad%20Gabriel%20Garc%C3%ADa%20M%C3%A1rquez&limit=1'
    );
    expect(exists).toBe(false);
  });

  test('checkBookExists returns false when no query parameter is provided', async () => {
    const fetchFn = vi.fn();
    const exists = await checkBookExists({}, { fetchFn });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(exists).toBe(false);
  });

  test('checkBookExists returns false when fetch rejects', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network error'));
    const exists = await checkBookExists({ title: 'Libro' }, { fetchFn });
    expect(exists).toBe(false);
  });
});
