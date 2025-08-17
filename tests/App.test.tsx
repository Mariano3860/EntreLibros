import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { fetchMe } from '../src/api/auth/me.service'
import App from '../src/App'
vi.mock('../src/hooks/api/useBooks', () => ({
  useBooks: () => ({ data: [] }),
}))

vi.mock('../src/api/auth/me.service', () => ({ fetchMe: vi.fn() }))

describe('App Component', () => {
  test('renders correctly for guest users', async () => {
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('unauthenticated'))

    render(<App />)

    expect(await screen.findByText('home.hero_title')).toBeVisible()
  })

  test('renders correctly for logged in users', async () => {
    vi.mocked(fetchMe).mockResolvedValueOnce({ id: 1 })

    render(<App />)

    expect(await screen.findByText('home.hero_logged_in_title')).toBeVisible()
  })
})
