import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  delete document.documentElement.dataset.apiMode
})

describe('enableMocking', () => {
  test('skips starting worker when mocks are explicitly disabled', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      useMocksEnv: 'no',
    })

    expect(worker.start).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.apiMode).toBeUndefined()
  })

  test('starts an isolated worker only when mocks are explicitly enabled', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({
      useMocksEnv: 'true',
    })

    expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'error' })
    expect(document.documentElement.dataset.apiMode).toBe('mock')
  })

  test('polyfills ProgressEvent before starting the worker', async () => {
    const originalProgressEvent = globalThis.ProgressEvent
    // @ts-expect-error - emulate environment without ProgressEvent
    delete globalThis.ProgressEvent

    const worker = { start: vi.fn() }
    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({ useMocksEnv: 'yes' })

    expect(typeof globalThis.ProgressEvent).toBe('function')
    expect(worker.start).toHaveBeenCalledWith({ onUnhandledRequest: 'error' })

    if (originalProgressEvent) {
      globalThis.ProgressEvent = originalProgressEvent
    } else {
      // @ts-expect-error - cleanup to original undefined state
      delete globalThis.ProgressEvent
    }
  })

  test('skips worker by default', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking()

    expect(worker.start).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.apiMode).toBeUndefined()
  })

  test('skips worker for unrecognized values', async () => {
    const worker = { start: vi.fn() }

    vi.doMock('@mocks/browser', () => ({ worker }))

    const { enableMocking } = await import('@src/setupMocks')

    await enableMocking({ useMocksEnv: 'auto' })

    expect(worker.start).not.toHaveBeenCalled()
  })
})
