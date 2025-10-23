import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe('enableMocking', () => {
  test('skips starting worker when mocks are explicitly disabled', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      nodeEnv: 'development',
      useMocksEnv: 'no',
      apiBaseUrl: '/api',
    })

    expect(worker.start).not.toHaveBeenCalled()
  })

  test('starts worker when explicitly enabled even in production with absolute base', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      nodeEnv: 'production',
      useMocksEnv: 'true',
      apiBaseUrl: 'https://example.com/api',
    })

    expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' })
  })

  test('polyfills ProgressEvent before starting the worker', async () => {
    const originalProgressEvent = globalThis.ProgressEvent
    // @ts-expect-error - emulate environment without ProgressEvent
    delete globalThis.ProgressEvent

    const worker = { start: vi.fn() }
    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({ nodeEnv: 'development', apiBaseUrl: '/api' })

    expect(typeof globalThis.ProgressEvent).toBe('function')
    expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' })

    if (originalProgressEvent) {
      globalThis.ProgressEvent = originalProgressEvent
    } else {
      // @ts-expect-error - cleanup to original undefined state
      delete globalThis.ProgressEvent
    }
  })

  test('skips worker in production when using absolute base without explicit enable', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      nodeEnv: 'production',
      useMocksEnv: undefined,
      apiBaseUrl: 'https://example.com/api',
    })

    expect(worker.start).not.toHaveBeenCalled()
  })

  test('skips worker in production when using relative base without explicit enable', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      nodeEnv: 'production',
      useMocksEnv: undefined,
      apiBaseUrl: '/api',
    })

    expect(worker.start).not.toHaveBeenCalled()
  })

  test('starts worker automatically in development when not explicitly configured', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({ nodeEnv: 'development', apiBaseUrl: '/api' })

    expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' })
  })
})
