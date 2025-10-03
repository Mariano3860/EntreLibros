import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { Header } from '@src/components/layout/header/Header'
import styles from '@src/components/layout/header/Header.module.scss'

import { renderWithProviders } from '../../test-utils'

vi.mock('@components/logo/LogoEntreLibros', () => ({
  LogoEntreLibros: ({
    redirectTo,
    withText,
  }: {
    redirectTo?: string
    withText?: boolean
  }) => (
    <div
      data-testid="logo"
      data-redirect={redirectTo}
      data-with-text={withText ? 'true' : 'false'}
    >
      Logo
    </div>
  ),
}))

vi.mock('@components/theme/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

vi.mock('@components/language-selector/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language</div>,
}))

describe('Header', () => {
  test('renders the logo with expected props and the control components', () => {
    renderWithProviders(<Header />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(styles.header)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-redirect', '/')
    expect(logo).toHaveAttribute('data-with-text', 'true')

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })
})
