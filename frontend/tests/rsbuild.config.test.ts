import { afterEach, describe, expect, test, vi } from 'vitest'

import config, { backendProxy, backendProxyTarget } from '../rsbuild.config'

describe('Rsbuild backend proxy', () => {
  test('proxies REST and Socket.IO paths to the local backend', () => {
    expect(config.server?.proxy).toBe(backendProxy)
    expect(backendProxy).toEqual({
      '/api': {
        target: backendProxyTarget,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendProxyTarget,
        changeOrigin: true,
        ws: true,
      },
    })
  })

  test('uses the configured backend proxy target when provided', async () => {
    vi.resetModules()
    vi.stubEnv('BACKEND_PROXY_TARGET', 'http://localhost:4100')

    const { backendProxyTarget: configuredTarget } = await import(
      '../rsbuild.config'
    )

    expect(configuredTarget).toBe('http://localhost:4100')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
