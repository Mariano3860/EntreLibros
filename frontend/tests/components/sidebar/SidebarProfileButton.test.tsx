import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@contexts/auth/AuthContext', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@contexts/auth/AuthContext')>()
  return { ...actual, useAuth: () => ({ isAuthenticated: true }) }
})

import { SidebarProfileButton } from '@src/components/sidebar/buttons/SidebarProfileButton'

import { renderWithProviders } from '../../test-utils'

describe('SidebarProfileButton', () => {
  test('links authenticated users to their profile', () => {
    renderWithProviders(<SidebarProfileButton onNavigate={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'profile.open' })).toHaveAttribute(
      'href',
      '/profile'
    )
  })
})
