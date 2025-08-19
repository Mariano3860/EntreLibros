import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ThemeIconButton } from '@src/components/theme/ThemeIconButton'
import * as useThemeModule from '@src/hooks/theme/useTheme'
import { renderWithProviders } from '../../test-utils'

describe('ThemeIconButton', () => {
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
})
