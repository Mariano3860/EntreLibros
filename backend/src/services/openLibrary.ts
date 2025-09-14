export interface OpenLibraryBook {
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
}

interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  isbn?: string[];
  publisher?: string[];
  first_publish_year?: number;
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
  numFound?: number;
}

export async function searchBooks(query: string): Promise<OpenLibraryBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
  const res = await fetch(url);
  const data: OpenLibrarySearchResponse = await res.json();
  return (data.docs ?? []).map((doc) => ({
    title: doc.title,
    author: doc.author_name ? doc.author_name[0] : null,
    isbn: doc.isbn ? doc.isbn[0] : null,
    publisher: doc.publisher ? doc.publisher[0] : null,
    publishedYear: doc.first_publish_year ?? null,
  }));
}

export async function checkBookExists(
  params: {
    title?: string;
    author?: string;
    isbn?: string;
  },
  options?: { fetchFn?: typeof fetch }
): Promise<boolean> {
  const fetchFn = options?.fetchFn ?? fetch;
  let query = '';
  if (params.isbn) {
    query = `isbn:${params.isbn}`;
  } else if (params.title) {
    query = params.title;
    if (params.author) {
      query += ` ${params.author}`;
    }
  } else {
    return false;
  }
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetchFn(url);
    const data: OpenLibrarySearchResponse = await res.json();
    return (data.numFound ?? 0) > 0;
  } catch {
    return false;
  }
}
