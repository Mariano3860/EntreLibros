import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateSuggestionItems } from './fakers/suggestions.faker'

export const suggestionsHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.SUGGESTIONS),
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    const items = generateSuggestionItems()
    return HttpResponse.json(items, { status: 200 })
  }
)
