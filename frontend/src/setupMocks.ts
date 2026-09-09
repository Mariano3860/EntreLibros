import { isPublicFlagEnabled } from '@utils/runtimeEnv'

export interface EnableMockingOptions {
  useMocksEnv?: string | null
}

const shouldBypassMapTiles = (request: Request) => {
  const hostname = new URL(request.url).hostname
  return hostname === 'server.arcgisonline.com'
}

export async function enableMocking(options: EnableMockingOptions = {}) {
  // PUBLIC_* values are injected by Rsbuild at startup, so changing .env
  // requires restarting dev or rebuilding before this decision can change.
  const useMocksEnv =
    options.useMocksEnv ?? import.meta.env.PUBLIC_API_USE_MOCKS ?? undefined
  // MSW is intentionally restricted to the test bundle. Local runtime data
  // must come from the API and database even if an old PUBLIC_* flag lingers.
  const explicitlyEnabled =
    import.meta.env.MODE === 'test' &&
    isPublicFlagEnabled(useMocksEnv?.toString())

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
  const startResult = await worker.start({
    onUnhandledRequest(request, print) {
      if (shouldBypassMapTiles(request)) return
      print.error()
    },
  })
  document.documentElement.dataset.apiMode = 'mock'
  return startResult
}
