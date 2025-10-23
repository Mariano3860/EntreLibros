import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { fetchSuggestions } from '@src/api/community/suggestions.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

describe('fetchSuggestions service', () => {
  test('returns suggestions list', async () => {
    const items = await fetchSuggestions()
    expect(items).toHaveLength(5)
  })

  test('throws on invalid response', async () => {
    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.SUGGESTIONS), () =>
        HttpResponse.json({ invalid: true })
      )
    )
    await expect(fetchSuggestions()).rejects.toThrow(
      'Invalid suggestions response'
    )
  })
})
