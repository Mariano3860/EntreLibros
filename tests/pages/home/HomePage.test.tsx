import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/hooks/api/useIsLoggedIn', () => ({
  useIsLoggedIn: vi.fn(),
}))

import { useIsLoggedIn } from '../../../src/hooks/api/useIsLoggedIn'
import { HomePage } from '../../../src/pages/home/HomePage'

import { renderWithProviders } from '../../test-utils'

describe('HomePage', () => {
  test('returns null while loading', () => {
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: false,
      isLoading: true,
      isError: false,
    })
    const { container } = renderWithProviders(<HomePage />)
    expect(container.firstChild).toBeNull()
  })

  test('renders guest hero when not logged in', () => {
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isError: false,
    })
    renderWithProviders(<HomePage />)
    expect(screen.getByText('home.hero_title')).toBeVisible()
    fireEvent.click(screen.getByText('home.hero_cta'))
    fireEvent.click(screen.getByText('home.explore_community'))
  })

  test('renders logged in hero', () => {
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isError: false,
    })
    renderWithProviders(<HomePage />)
    expect(screen.getByText('home.hero_logged_in_title')).toBeVisible()
  })
})
