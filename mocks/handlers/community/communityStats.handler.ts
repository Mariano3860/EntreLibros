import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import statsResponse from './fixtures/communityStats.json'

export const communityStatsHandler = http.get(
  RELATIVE_API_ROUTES.COMMUNITY.STATS,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    return HttpResponse.json(statsResponse, { status: 200 })
  }
)
