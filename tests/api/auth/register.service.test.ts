import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { DEFAULT_EMAIL } from '@mocks/constants/constants'
import { registerHandler } from '@mocks/handlers/auth/register.handler'
import { register } from '@src/api/auth/register.service'

const server = setupServer(registerHandler)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('register service', () => {
  test('fails when email already exists', async () => {
    await expect(
      register({ name: 'User', email: DEFAULT_EMAIL, password: 'pass' })
    ).rejects.toMatchObject({
      response: { status: 409, data: { error: 'EmailExists' } },
    })
  })

  test('registers successfully with new email', async () => {
    const response = await register({
      name: 'User',
      email: 'unique@example.com',
      password: 'pass',
    })
    expect(response).toMatchObject({ message: 'auth.success.register' })
  })
})
