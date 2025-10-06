import { describe, expect, test, vi } from 'vitest';
import {
  searchBooksApiResults,
  checkBookExists,
} from '../../src/services/openLibrary.js';

function mkRes(body: unknown, init?: Partial<Response>): Response {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    statusText: init?.statusText ?? 'OK',
    json: async () => body,
  } as unknown as Response;
}

describe('openLibrary service (fully mocked)', () => {
  test('searchBooksApiResults maps Open Library docs to ApiBookSearchResult', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      mkRes({
        docs: [
          {
            key: '/works/OL123W',
            edition_key: ['OL9999M'],
            title: 'Test Title',
            author_name: ['Author One', 'Author Two'],
            isbn: ['1234567890'],
            publisher: ['Publisher Inc.'],
            first_publish_year: 1999,
            cover_i: 321,
            language: ['eng'],
          },
        ],
      })
    );

    const results = await searchBooksApiResults('test query', mockFetch);
    expect(results).toEqual([
      {
        id: 'OL9999M',
        title: 'Test Title',
        author: 'Author One',
        publisher: 'Publisher Inc.',
        year: 1999,
        language: 'eng',
        isbn: '1234567890',
        coverUrl: 'https://covers.openlibrary.org/b/id/321-M.jpg',
      },
    ]);

    // Verify request URL and headers without hitting the network
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const url = new URL(calledUrl);
    expect(url.origin + url.pathname).toBe(
      'https://openlibrary.org/search.json'
    );
    expect(url.searchParams.get('q')).toBe('test query');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('fields')).toBe(
      'key,title,author_name,first_publish_year,language,cover_i,edition_key,isbn,publisher'
    );
    expect((init.headers as Record<string, string>)['User-Agent']).toBe(
      'CornersApp/1.0 (+https://github.com/Mariano3860)'
    );
  });

  test('checkBookExists returns true via ISBN edition endpoint', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mkRes({}, { ok: true, status: 200 }));

    const exists = await checkBookExists(
      { isbn: '9780140328721' },
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(exists).toBe(true);
    const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://openlibrary.org/isbn/9780140328721.json');
  });

  test('checkBookExists falls back to search by isbn when edition lookup is 404', async () => {
    const mockFetch = vi
      .fn()
      // First call: /isbn/... -> 404
      .mockResolvedValueOnce(
        mkRes({}, { ok: false, status: 404, statusText: 'Not Found' })
      )
      // Second call: /search.json?isbn=... -> found
      .mockResolvedValueOnce(mkRes({ numFound: 1 }, { ok: true, status: 200 }));

    const exists = await checkBookExists(
      { isbn: '9780140328721' },
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(exists).toBe(true);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://openlibrary.org/isbn/9780140328721.json',
      expect.any(Object)
    );

    const [url2] = mockFetch.mock.calls[1] as [string, RequestInit];
    const u2 = new URL(url2);
    expect(u2.origin + u2.pathname).toBe('https://openlibrary.org/search.json');
    expect(u2.searchParams.get('isbn')).toBe('9780140328721');
    expect(u2.searchParams.get('limit')).toBe('1');
  });

  test('checkBookExists builds query from title and author when ISBN missing', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(mkRes({ numFound: 0 }));

    const exists = await checkBookExists(
      { title: 'Cien años de soledad', author: 'Gabriel García Márquez' },
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(exists).toBe(false);
    const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
    const url = new URL(calledUrl);
    expect(url.origin + url.pathname).toBe(
      'https://openlibrary.org/search.json'
    );
    expect(url.searchParams.get('title')).toBe('Cien años de soledad');
    expect(url.searchParams.get('author')).toBe('Gabriel García Márquez');
    expect(url.searchParams.get('limit')).toBe('1');
  });

  test('checkBookExists returns false when no query parameter is provided', async () => {
    const mockFetch = vi.fn();

    const exists = await checkBookExists(
      {},
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(exists).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('checkBookExists returns false when fetch rejects', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network error'));

    const exists = await checkBookExists(
      { title: 'Libro' },
      { fetchFn: mockFetch as unknown as typeof fetch }
    );

    expect(exists).toBe(false);
  });
});
