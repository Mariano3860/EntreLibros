import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { generateUserBooks } from './fakers/userBooks.faker'

export const userBooksHandler = http.get(
  RELATIVE_API_ROUTES.BOOKS.MINE,
  async ({ request }) => {
    const url = new URL(request.url)
    const seedParam = url.searchParams.get('seed')
    const seed = seedParam ? Number(seedParam) : undefined
    await new Promise((r) => setTimeout(r, 200))
    const books = generateUserBooks(seed)
    return HttpResponse.json(books, { status: 200 })
  }
)
