import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { generateCommunityStats } from './fakers/communityStats.faker'

export const communityStatsHandler = http.get(
  RELATIVE_API_ROUTES.COMMUNITY.STATS,
  async () => {
    await new Promise((r) => setTimeout(r, 200))
    const statsResponse = generateCommunityStats()
    return HttpResponse.json(statsResponse, { status: 200 })
  }
)
