import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { generateBooks } from './fakers/books.faker'

export const booksHandler = http.get(
  RELATIVE_API_ROUTES.BOOKS.LIST,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    const books = generateBooks()
    return HttpResponse.json(books, { status: 200 })
  }
)
