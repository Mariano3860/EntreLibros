import { logoutHandler } from '@mocks/handlers/auth/logout.handler'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { logout } from '@/api/auth/logout.service'

const server = setupServer(logoutHandler)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('logout service', () => {
  test('clears authentication cookies', async () => {
    document.cookie = 'sessionToken=token; path=/'
    await logout()
    expect(document.cookie).not.toContain('sessionToken')
  })
})
