import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

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
      t: (key: string) => key, // Devuelve la key directamente
      i18n: { changeLanguage: () => Promise.resolve() },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  }
})

// Clear cookies after each test to avoid cross-test contamination
afterEach(() => {
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
})
