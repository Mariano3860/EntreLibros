import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { fetchMe } from '@src/api/auth/me.service'
import App from '@src/App'
vi.mock('@src/hooks/api/useBooks', () => ({
  useBooks: () => ({ data: [] }),
}))
vi.mock('@src/api/auth/me.service', () => ({ fetchMe: vi.fn() }))

describe('App Component', () => {
  test('renders correctly for guest users', async () => {
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('unauthenticated'))

    render(<App />)

    expect(await screen.findByText(/Encontr/)).toBeVisible()
  })

  test('renders correctly for logged in users', async () => {
    vi.mocked(fetchMe).mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
    })

    render(<App />)

    expect(await screen.findByText(/¡Bienvenido de nuevo/)).toBeVisible()
  })
})
