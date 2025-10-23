import { resolvedApiBaseUrl } from '@src/api/axios'

const ENABLE_VALUES = ['true', '1', 'yes'] as const
const DISABLE_VALUES = ['false', '0', 'no'] as const

export interface EnableMockingOptions {
  nodeEnv?: string | null
  useMocksEnv?: string | null
  apiBaseUrl?: string | null
}

export async function enableMocking(options: EnableMockingOptions = {}) {
  const runtimeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? ''
  const useMocksEnv =
    options.useMocksEnv ?? import.meta.env.PUBLIC_API_USE_MOCKS ?? undefined
  const normalizedEnv = useMocksEnv?.toString().trim().toLowerCase()
  const explicitlyEnabled = normalizedEnv
    ? ENABLE_VALUES.includes(normalizedEnv as (typeof ENABLE_VALUES)[number])
    : false
  const explicitlyDisabled = normalizedEnv
    ? DISABLE_VALUES.includes(normalizedEnv as (typeof DISABLE_VALUES)[number])
    : false
  const baseUrl = options.apiBaseUrl ?? resolvedApiBaseUrl
  const hasAbsoluteBase = /^https?:\/\//.test(baseUrl ?? '')
  const isMockableEnv = runtimeEnv === 'development' || runtimeEnv === 'test'

  if (explicitlyDisabled) {
    return
  }

  if (!explicitlyEnabled && hasAbsoluteBase && runtimeEnv === 'production') {
    return
  }

  if (!isMockableEnv && !explicitlyEnabled) {
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
  return worker.start({ onUnhandledRequest: 'bypass' })
}
