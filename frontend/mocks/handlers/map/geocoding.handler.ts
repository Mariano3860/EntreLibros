import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateGeocodingSuggestions } from './fakers/geocoding.faker'

export const geocodingHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.MAP.GEOCODE),
  ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') ?? ''
    const suggestions = generateGeocodingSuggestions(query)
    return HttpResponse.json(suggestions, { status: 200 })
  }
)
