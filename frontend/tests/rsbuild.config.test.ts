import { describe, expect, test } from 'vitest'

import config, {
  backendProxy,
  backendProxyTarget,
} from '../rsbuild.config'

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
})
