import { describe, expect, test } from 'vitest'

import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { fetchMe } from '@src/api/auth/me.service'

describe('me service', () => {
  test('fails when user is not authenticated', async () => {
    await expect(fetchMe()).rejects.toMatchObject({
      response: { status: 401 },
    })
  })

  test('returns user data when authenticated', async () => {
    setLoggedInState(true)
    const response = await fetchMe()
    expect(response).toMatchObject({ id: 'u_1' })
    setLoggedInState(false)
  })
})
