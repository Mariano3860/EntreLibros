import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { generateFeedItems } from './fakers/feed.faker'

export const communityFeedHandler = http.get(
  RELATIVE_API_ROUTES.COMMUNITY.FEED,
  ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '8')
    const items = generateFeedItems(page, size)
    return HttpResponse.json(items, { status: 200 })
  }
)
