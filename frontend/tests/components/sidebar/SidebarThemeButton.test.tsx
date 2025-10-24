import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { SidebarThemeButton } from '@src/components/sidebar/buttons/SidebarThemeButton'

import { renderWithProviders } from '../../test-utils'

const mockToggleTheme = vi.fn()
const mockUseTheme = vi.fn(() => ({
  theme: 'light',
  toggleTheme: mockToggleTheme,
}))

vi.mock('@hooks/theme/useTheme', () => ({
  useTheme: () => mockUseTheme(),
}))

describe('SidebarThemeButton', () => {
  test('renders theme button with light theme label', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })

    renderWithProviders(<SidebarThemeButton />)

    expect(screen.getByLabelText('Theme')).toBeInTheDocument()
    expect(screen.getByText('theme.mode.light')).toBeInTheDocument()
  })

  test('renders theme button with dark theme label', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    })

    renderWithProviders(<SidebarThemeButton />)

    expect(screen.getByLabelText('Theme')).toBeInTheDocument()
    expect(screen.getByText('theme.mode.dark')).toBeInTheDocument()
  })

  test('calls toggleTheme when button is clicked', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })

    renderWithProviders(<SidebarThemeButton />)

    const themeButton = screen.getByLabelText('Theme')
    fireEvent.click(themeButton)

    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
