import { describe, expect, test } from 'vitest'

import clearAllCookies from '@src/utils/cookies'

describe('clearAllCookies', () => {
  test('removes all cookies', () => {
    document.cookie = 'a=1'
    document.cookie = 'b=2'
    clearAllCookies()
    expect(document.cookie).toBe('')
  })

  test('handles cookies without equals sign', () => {
    document.cookie = 'noequal'
    clearAllCookies()
  })

  test('handles missing document gracefully', () => {
    const original = global.document
    // @ts-expect-error - simulate environment without document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).document
    expect(() => clearAllCookies()).not.toThrow()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).document = original
  })
})
