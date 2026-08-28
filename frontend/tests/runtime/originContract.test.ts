import { describe, expect, test } from 'vitest'
import { resolvedApiBaseUrl } from '@api/axios'

describe('Frontend Origin & API Contract', () => {
  test('defaults to relative /api when PUBLIC_API_BASE_URL is unconfigured or empty', () => {
    expect(resolvedApiBaseUrl).toBe('/api')
  })
})
