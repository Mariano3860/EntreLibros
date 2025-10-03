import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { ThemeIconButton } from '@src/components/theme/ThemeIconButton'
import * as useThemeModule from '@src/hooks/theme/useTheme'

import { renderWithProviders } from '../../test-utils'

describe('ThemeIconButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('calls toggleTheme when clicked', () => {
    const toggleTheme = vi.fn()
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
      theme: 'light',
      toggleTheme,
    })
    renderWithProviders(<ThemeIconButton />)
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(toggleTheme).toHaveBeenCalled()
  })

  test('shows dark mode label when theme is dark', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
    })

    renderWithProviders(<ThemeIconButton />)

    expect(screen.getByText(/dark mode/i)).toBeInTheDocument()
  })
})
