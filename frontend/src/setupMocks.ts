const ENABLE_VALUES = ['true', '1', 'yes'] as const

export interface EnableMockingOptions {
  useMocksEnv?: string | null
}

export async function enableMocking(options: EnableMockingOptions = {}) {
  const useMocksEnv =
    options.useMocksEnv ?? import.meta.env.PUBLIC_API_USE_MOCKS ?? undefined
  const normalizedEnv = useMocksEnv?.toString().trim().toLowerCase()
  const explicitlyEnabled = normalizedEnv
    ? ENABLE_VALUES.includes(normalizedEnv as (typeof ENABLE_VALUES)[number])
    : false

  if (!explicitlyEnabled) {
    return
  }

  // MSW requires ProgressEvent to initialize the service worker in certain test
  // environments (e.g., jsdom, happy-dom) that don't provide this API natively.
  if (typeof globalThis.ProgressEvent === 'undefined') {
    class ProgressEvent extends Event {
      constructor(type: string, eventInitDict?: EventInit) {
        super(type, eventInitDict)
      }
    }
    // @ts-expect-error - polyfilling for environments without ProgressEvent
    globalThis.ProgressEvent = ProgressEvent
  }

  const { worker } = await import('@mocks/browser')
  delete document.documentElement.dataset.apiMode
  const startResult = await worker.start({ onUnhandledRequest: 'error' })
  document.documentElement.dataset.apiMode = 'mock'
  return startResult
}
