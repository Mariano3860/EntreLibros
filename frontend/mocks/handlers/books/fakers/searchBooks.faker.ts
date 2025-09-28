import { ApiBookSearchResult } from '@src/api/books/searchBooks.types'

const SEARCH_DATA: ApiBookSearchResult[] = [
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    year: 1949,
    language: 'Español',
    format: 'Tapa blanda',
    isbn: '9780451524935',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg?default=false',
  },
  {
    id: 'sapiens',
    title: 'Sapiens: De animales a dioses',
    author: 'Yuval Noah Harari',
    publisher: 'Debate',
    year: 2014,
    language: 'Español',
    format: 'Tapa blanda',
    isbn: '9786071131071',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9786071131071-L.jpg?default=false',
  },
  {
    id: 'el-principito',
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    publisher: 'Emecé',
    year: 1943,
    language: 'Español',
    format: 'Tapa dura',
    isbn: '9789507315586',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9789507315586-L.jpg?default=false',
  },
  {
    id: 'fahrenheit-451',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    publisher: 'Ballantine Books',
    year: 1953,
    language: 'Inglés',
    format: 'Paperback',
    isbn: '9780345342966',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780345342966-L.jpg?default=false',
  },
  {
    id: 'cien-anos-soledad',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    publisher: 'Sudamericana',
    year: 1967,
    language: 'Español',
    format: 'Tapa blanda',
    isbn: '9788439732471',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9788439732471-L.jpg?default=false',
  },
]

export const searchBooksDataset = (query: string): ApiBookSearchResult[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return SEARCH_DATA.filter((book) => {
    const haystack = `${book.title} ${book.author} ${book.isbn}`.toLowerCase()
    return haystack.includes(normalized)
  })
}
