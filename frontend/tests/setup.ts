import 'tsconfig-paths/register'
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import enTranslations from '@src/assets/i18n/locales/en/common.json'
import esTranslations from '@src/assets/i18n/locales/es/common.json'
import { server } from '@mocks/server'

let currentLanguage = 'es'
const resolvedTestNamespaces = [
  'localizedUi.',
  'map.controls.',
  'community.ui.',
  'community.messages.badges.unreadCount',
  'community.messages.deleteConversation.',
  'community.messages.drafts.',
  'community.messages.newConversation.open',
  'community.messages.ui.',
  'booksPage.badge.',
  'booksPage.cover_alt',
  'booksPage.status.',
  'publishBook.preview.condition.',
  'profile.dashboard.',
  'profile.interestOptions.',
]
const resolveNewTranslation = (key: string) => {
  const isEnglishOnlyAuthCopy =
    [
      'welcome',
      'login_subtitle',
      'email',
      'password',
      'login',
      'register',
      'name',
      'confirm_password',
      'no_account',
      'have_account',
      'authenticating',
    ].includes(key) ||
    key.startsWith('auth.') ||
    key.startsWith('form.errors.')
  const isEnglishOnlyNamespace =
    key.startsWith('booksPage.') ||
    key.startsWith('publishBook.') ||
    key.startsWith('community.messages.') ||
    key.startsWith('profile.') ||
    key.startsWith('publicProfile.') ||
    key.startsWith('reports.') ||
    key.startsWith('localizedUi.stats.') ||
    isEnglishOnlyAuthCopy ||
    key === 'bookDetail.close' ||
    key === 'bookDetail.cancel'
  const isPreviouslyResolvedSpanishNamespace =
    key.startsWith('booksPage.badge.') ||
    key === 'booksPage.cover_alt' ||
    key.startsWith('booksPage.status.') ||
    key.startsWith('publishBook.preview.condition.') ||
    key.startsWith('community.messages.badges.unreadCount') ||
    key.startsWith('community.messages.deleteConversation.') ||
    key.startsWith('community.messages.drafts.') ||
    key.startsWith('community.messages.newConversation.open') ||
    key.startsWith('community.messages.ui.') ||
    key.startsWith('profile.dashboard.') ||
    key.startsWith('profile.interestOptions.') ||
    key.startsWith('localizedUi.stats.') ||
    key.startsWith('reports.') ||
    key === 'bookDetail.close' ||
    key === 'bookDetail.cancel'

  if (
    currentLanguage !== 'en' &&
    isEnglishOnlyNamespace &&
    !isPreviouslyResolvedSpanishNamespace
  ) {
    return undefined
  }

  const isResolvedTestNamespace = resolvedTestNamespaces.some((namespace) =>
    key.startsWith(namespace)
  )
  if (
    !isResolvedTestNamespace &&
    !(
      isEnglishOnlyNamespace &&
      (currentLanguage === 'en' || isPreviouslyResolvedSpanishNamespace)
    )
  ) {
    return undefined
  }
  const resource = currentLanguage === 'en' ? enTranslations : esTranslations
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[part]
  }, resource)
}
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
        const resolved = resolveNewTranslation(key)
        const template =
          (typeof resolved === 'string' ? resolved : undefined) ??
          (typeof options?.defaultValue === 'string'
            ? options.defaultValue
            : undefined) ??
          key

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
