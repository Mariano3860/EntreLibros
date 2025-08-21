import { describe, expect, test, vi } from 'vitest'

import { track } from '@src/utils/analytics'

describe('analytics track', () => {
  test('logs events outside test and production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    track('example', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith('track', 'example', { foo: 'bar' })
    spy.mockRestore()
    process.env.NODE_ENV = originalEnv
  })
})
