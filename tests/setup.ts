import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
