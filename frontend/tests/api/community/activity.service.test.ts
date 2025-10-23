import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { fetchActivityItems } from '@src/api/community/activity.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchActivityItems service', () => {
  test('returns activity list', async () => {
    const items = await fetchActivityItems()
    expect(items).toHaveLength(10)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.ACTIVITY), () =>
        HttpResponse.json({ invalid: true })
      )
    )
    await expect(fetchActivityItems()).rejects.toThrow(
      'Invalid activity response'
    )
  })
})
