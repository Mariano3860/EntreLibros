import { describe, expect, test } from 'vitest'

import { DEFAULT_EMAIL, DEFAULT_PASS } from '@mocks/constants/constants'
import { login } from '@src/api/auth/login.service'

describe('login service', () => {
  test('fails with invalid credentials', async () => {
    await expect(
      login({ email: 'wrong@example.com', password: 'bad' })
    ).rejects.toMatchObject({
      response: { status: 401, data: { error: 'InvalidCredentials' } },
    })
  })

  test('logs in with correct credentials', async () => {
    const response = await login({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASS,
    })
    expect(response.user.email).toBe(DEFAULT_EMAIL)
    expect(document.cookie).toContain('sessionToken')
  })
})
