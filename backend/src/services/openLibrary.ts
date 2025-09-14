export interface OpenLibraryBook {
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
}

export async function searchBooks(query: string): Promise<OpenLibraryBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.docs ?? []).map((doc: any) => ({
    title: doc.title,
    author: doc.author_name ? doc.author_name[0] : null,
    isbn: doc.isbn ? doc.isbn[0] : null,
    publisher: doc.publisher ? doc.publisher[0] : null,
    publishedYear: doc.first_publish_year ?? null,
  }));
}

export async function checkBookExists(params: {
  title?: string;
  author?: string;
  isbn?: string;
}): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
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
    const res = await fetch(url);
    const data = await res.json();
    return (data.numFound ?? 0) > 0;
  } catch {
    return false;
  }
}
