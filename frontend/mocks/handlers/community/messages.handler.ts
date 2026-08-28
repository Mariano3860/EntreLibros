import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

const UNAVAILABLE_BOOKS = new Set(['el principito', 'neuromante', 'rayuela'])

export const messagesAvailabilityHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.MESSAGES.AVAILABILITY),
  ({ request }) => {
    const url = new URL(request.url)
    const book = url.searchParams.get('book')?.toLowerCase()?.trim()

    if (!book) {
      return HttpResponse.json({ available: false }, { status: 400 })
    }

    const available = !UNAVAILABLE_BOOKS.has(book)

    return HttpResponse.json({ available })
  }
)
