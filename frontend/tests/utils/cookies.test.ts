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
    const original = globalThis.document
    delete (globalThis as { document?: Document }).document
    expect(() => clearAllCookies()).not.toThrow()
    ;(globalThis as { document?: Document }).document = original
  })
})
