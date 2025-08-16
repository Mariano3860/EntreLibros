import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import App from '../src/App'
import { useIsLoggedIn } from '../src/hooks/api/useIsLoggedIn'

vi.mock('../src/hooks/api/useIsLoggedIn')

describe('App Component', () => {
  test('renders correctly for guest users', () => {
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: false,
      isLoading: false,
      isError: false,
    })

    render(<App />)

    expect(screen.getByText('home.hero_title')).toBeVisible()
  })

  test('renders correctly for logged in users', () => {
    vi.mocked(useIsLoggedIn).mockReturnValue({
      isLoggedIn: true,
      isLoading: false,
      isError: false,
    })

    render(<App />)

    expect(screen.getByText('home.hero_logged_in_title')).toBeVisible()
  })
})
