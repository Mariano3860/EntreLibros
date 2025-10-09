import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateBooks } from './fakers/books.faker'

export const booksHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST),
  async ({ request, cookies }) => {
    const url = new URL(request.url)
    const seedParam = url.searchParams.get('seed')
    const seed = seedParam ? Number(seedParam) : undefined
    const language = cookies.language || 'es'
    await new Promise((r) => setTimeout(r, 200))
    const books = generateBooks(seed, language)
    return HttpResponse.json(books, { status: 200 })
  }
)
