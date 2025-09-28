import 'tsconfig-paths/register'
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from '@mocks/server'

let currentLanguage = 'es'
const changeLanguageMock = vi.fn(async (lng: string) => {
  currentLanguage = lng
})

if (typeof globalThis.ProgressEvent === 'undefined') {
  class ProgressEvent extends Event {
    constructor(type: string, eventInitDict?: EventInit) {
      super(type, eventInitDict)
    }
  }
  // @ts-expect-error - add ProgressEvent to the global scope for MSW interceptors
  globalThis.ProgressEvent = ProgressEvent
}

// Mock SVGs
vi.mock('.*\\.svg$', () => ({
  default: () => '<svg />',
}))

// Mock i18n
vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next')
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        const template =
          (typeof options?.defaultValue === 'string'
            ? options.defaultValue
            : undefined) ?? key

        if (!options) return template

        return template.replace(/{{(.*?)}}/g, (_, varName: string) => {
          const trimmed = varName.trim()
          const value = options[trimmed]
          return value !== undefined ? String(value) : ''
        })
      },
      i18n: {
        changeLanguage: changeLanguageMock,
        get language() {
          return currentLanguage
        },
      },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  }
})

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))

// Clear cookies and reset handlers after each test to avoid cross-test contamination
afterEach(() => {
  server.resetHandlers()
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
  currentLanguage = 'es'
  changeLanguageMock.mockClear()
})

afterAll(() => server.close())
