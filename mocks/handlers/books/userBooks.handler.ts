import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { generateUserBooks } from './fakers/userBooks.faker'

export const userBooksHandler = http.get(
  RELATIVE_API_ROUTES.BOOKS.MINE,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    const books = generateUserBooks()
    return HttpResponse.json(books, { status: 200 })
  }
)
