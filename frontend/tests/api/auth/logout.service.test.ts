import { describe, expect, test } from 'vitest'

import { logout } from '@src/api/auth/logout.service'

describe('logout service', () => {
  test('clears authentication cookies', async () => {
    document.cookie = 'sessionToken=token; path=/'
    await logout()
    expect(document.cookie).not.toContain('sessionToken')
  })
})
