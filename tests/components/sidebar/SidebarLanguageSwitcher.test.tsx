import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const changeLanguage = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage },
  }),
}))

import { SidebarLanguageSwitcher } from '@src/components/sidebar/buttons/SidebarLanguageSwitcher'
import { renderWithProviders } from '../../test-utils'

describe('SidebarLanguageSwitcher', () => {
  test('toggles dropdown and changes language', () => {
    renderWithProviders(<SidebarLanguageSwitcher />)
    const toggle = screen.getByRole('button', { name: 'language.label' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'language.es' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'language.en' }))
    expect(changeLanguage).toHaveBeenCalledWith('en')
    expect(
      screen.queryByRole('button', { name: 'language.es' })
    ).not.toBeInTheDocument()
  })
})
