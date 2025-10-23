import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { fetchCommunityFeed } from '@src/api/community/communityFeed.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchCommunityFeed service', () => {
  test('returns feed items', async () => {
    const items = await fetchCommunityFeed(0, 8)
    expect(items).toHaveLength(8)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FEED), () =>
        HttpResponse.json({ invalid: true })
      )
    )
    await expect(fetchCommunityFeed()).rejects.toThrow('Invalid feed response')
  })
})
