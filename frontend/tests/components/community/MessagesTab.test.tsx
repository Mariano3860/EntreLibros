import { renderWithProviders } from '../../test-utils'
import { describe, expect, test, vi } from 'vitest'

const translations = vi.hoisted(() => ({
  'community.messages.title': 'Mensajes',
  'community.messages.placeholder': 'Lista de mensajes',
})) as Record<string, string>

vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next')
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        const template = translations[key] ?? options?.defaultValue ?? key
        if (!options) return template
        return template.replace(/{{(.*?)}}/g, (_: string, varName: string) => {
          const trimmed = varName.trim()
          const value = options[trimmed]
          return value !== undefined ? String(value) : ''
        })
      },
      i18n: { changeLanguage: () => Promise.resolve() },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
  }
})

import { MessagesTab } from '@components/community/MessagesTab'

describe('MessagesTab', () => {
  test('renders translated title and placeholder', () => {
    const { getByRole, getByText } = renderWithProviders(<MessagesTab />)

    expect(
      getByRole('heading', { level: 2, name: 'Mensajes' })
    ).toBeInTheDocument()
    expect(getByText('Lista de mensajes')).toBeInTheDocument()
  })
})
