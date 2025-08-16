import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@/api/routes'

import booksResponse from './fixtures/books.json'

export const booksHandler = http.get(
  RELATIVE_API_ROUTES.BOOKS.LIST,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    return HttpResponse.json(booksResponse, { status: 200 })
  }
)
