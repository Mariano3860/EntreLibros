import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { prototypeCatalog } from '@src/features/prototype/catalog'

export const userActivityHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.USER.ACTIVITY),
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return HttpResponse.json([
      {
        id: 'activity-demo-1',
        bookTitle: prototypeCatalog.books[0].title,
        action: 'offered',
        coverUrl: '/prototype/book-cover.svg',
        timestamp: '2026-08-30T10:00:00.000Z',
      },
    ])
  }
)
