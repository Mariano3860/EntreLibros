export interface ApiBookSearchResult {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  year?: number;
  language?: string;
  format?: string;
  isbn?: string;
  coverUrl?: string;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  language?: string[];
  cover_i?: number;
  edition_key?: string[];
  isbn?: string[];
  publisher?: string[];
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
  numFound?: number;
  num_found?: number;
  start?: number;
}

const DEFAULT_FETCH_INIT: RequestInit = {
  headers: {
    'User-Agent': 'CornersApp/1.0 (+https://github.com/Mariano3860)',
  },
};

async function getJson<T>(url: string, fetchFn: typeof fetch): Promise<T> {
  const res = await fetchFn(url, DEFAULT_FETCH_INIT);
  if (!res.ok) {
    throw new Error(
      `OpenLibrary request failed ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as T;
}

function coverUrlFromId(cover_i?: number): string | undefined {
  return typeof cover_i === 'number'
    ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`
    : undefined;
}

export async function searchBooksApiResults(
  query: string,
  fetchFn: typeof fetch = fetch
): Promise<ApiBookSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    q,
    limit: '10',
    fields:
      'key,title,author_name,first_publish_year,language,cover_i,edition_key,isbn,publisher',
  });

  const url = `https://openlibrary.org/search.json?${params.toString()}`;
  const data = await getJson<OpenLibrarySearchResponse>(url, fetchFn);
  const docs = data.docs ?? [];

  return docs.map((d, idx): ApiBookSearchResult => {
    const id = (d.edition_key && d.edition_key[0]) || d.key || `local-${idx}`;
    return {
      id,
      title: d.title ?? '',
      author: d.author_name?.[0] ?? '',
      publisher: d.publisher?.[0] || undefined,
      year: d.first_publish_year ?? undefined,
      language: d.language?.[0] || undefined,
      isbn: d.isbn?.[0] || undefined,
      coverUrl: coverUrlFromId(d.cover_i),
    };
  });
}

export async function checkBookExists(
  params: { title?: string; author?: string; isbn?: string },
  options?: { fetchFn?: typeof fetch }
): Promise<boolean> {
  const fetchFn = options?.fetchFn ?? fetch;

  const isbn = params.isbn?.trim();
  const title = params.title?.trim();
  const author = params.author?.trim();

  if (isbn) {
    try {
      const byIsbnUrl = `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`;
      const res = await fetchFn(byIsbnUrl, DEFAULT_FETCH_INIT);
      if (res.ok) return true;
      if (res.status !== 404) {
        // Non\-404 error, fall through to search
      }
    } catch {
      // Network error, fall through to search
    }
    // Fallback: search by explicit isbn param
    try {
      const url = `https://openlibrary.org/search.json?${new URLSearchParams({
        isbn,
        limit: '1',
      }).toString()}`;
      const data = await getJson<OpenLibrarySearchResponse>(url, fetchFn);
      return (data.numFound ?? data.num_found ?? 0) > 0;
    } catch {
      return false;
    }
  }

  // Title/author search with explicit params; avoid empty q
  if (!title && !author) return false;

  const sp = new URLSearchParams({ limit: '1' });
  if (title) sp.set('title', title);
  if (author) sp.set('author', author);

  const url = `https://openlibrary.org/search.json?${sp.toString()}`;
  try {
    const data = await getJson<OpenLibrarySearchResponse>(url, fetchFn);
    return (data.numFound ?? data.num_found ?? 0) > 0;
  } catch {
    return false;
  }
}
