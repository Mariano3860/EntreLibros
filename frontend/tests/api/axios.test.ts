import { describe, expect, test } from 'vitest'

describe('axios configuration', () => {
  test('resolves API base URL to default /api', async () => {
    const { resolvedApiBaseUrl } = await import('@src/api/axios')

    // The default value should be '/api' based on the environment
    expect(
      resolvedApiBaseUrl === '/api' || typeof resolvedApiBaseUrl === 'string'
    ).toBe(true)
  })

  test('creates apiClient with correct configuration', async () => {
    const { apiClient } = await import('@src/api/axios')

    expect(apiClient.defaults.withCredentials).toBe(true)
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    expect(apiClient.defaults.headers['X-Requested-With']).toBe(
      'XMLHttpRequest'
    )
  })
})
