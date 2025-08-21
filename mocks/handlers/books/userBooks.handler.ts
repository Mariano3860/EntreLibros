import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { ApiUserBook } from '@src/api/books/userBooks.types'

import books from './fixtures/userBooks.json'

export const userBooksHandler = http.get(
  RELATIVE_API_ROUTES.BOOKS.MINE,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    return HttpResponse.json(books as ApiUserBook[], { status: 200 })
  }
)
