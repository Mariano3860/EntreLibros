import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

export const userActivityHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.USER.ACTIVITY),
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return HttpResponse.json([
      {
        id: 'activity-demo-1',
        bookTitle: '1984',
        action: 'offered',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ])
  }
)
