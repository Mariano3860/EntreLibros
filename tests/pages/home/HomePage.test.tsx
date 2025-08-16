import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn(),
}))
vi.mock('../../../src/hooks/api/useBooks', () => ({
  useBooks: () => ({ data: [] }),
}))

import { fetchMe } from '../../../src/api/auth/me.service'
import { HomePage } from '../../../src/pages/home/HomePage'
import { renderWithProviders } from '../../test-utils'

describe('HomePage', () => {
  test('returns null while loading', () => {
    vi.mocked(fetchMe).mockReturnValue(new Promise(() => {}))
    const { container } = renderWithProviders(<HomePage />)
    expect(container.firstChild).toBeNull()
  })

  test('renders guest hero when not logged in', async () => {
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('unauthenticated'))
    renderWithProviders(<HomePage />)
    expect(await screen.findByText('home.hero_title')).toBeVisible()
    fireEvent.click(screen.getByText('home.hero_cta'))
    fireEvent.click(screen.getByText('home.explore_community'))
  })

  test('renders logged in hero', async () => {
    vi.mocked(fetchMe).mockResolvedValueOnce({ id: 1 })
    renderWithProviders(<HomePage />)
    expect(await screen.findByText('home.hero_logged_in_title')).toBeVisible()
  })
})
