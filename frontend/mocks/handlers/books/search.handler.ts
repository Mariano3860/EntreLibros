import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { searchBooksDataset } from './fakers/searchBooks.faker'

export const searchBooksHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.SEARCH),
  async ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') ?? ''

    await new Promise((resolve) => setTimeout(resolve, 250))

    if (query.toLowerCase().includes('error')) {
      return HttpResponse.json(
        { message: 'book search failed' },
        { status: 500 }
      )
    }

    if (query.toLowerCase().includes('empty')) {
      return HttpResponse.json([], { status: 200 })
    }

    const results = searchBooksDataset(query)
    return HttpResponse.json(results, { status: 200 })
  }
)
