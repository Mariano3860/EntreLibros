import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn(),
}))

const useBooksMock = vi.fn()
vi.mock('../../../src/hooks/api/useBooks', () => ({
  useBooks: () => useBooksMock(),
}))

beforeEach(() => {
  useBooksMock.mockReturnValue({ data: [] })
})

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

  test('handles malformed book data without crashing', async () => {
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('unauthenticated'))
    useBooksMock.mockReturnValue({ data: {} })
    renderWithProviders(<HomePage />)
    expect(await screen.findByText('home.hero_title')).toBeVisible()
  })

  test('renders book list when data is available', async () => {
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('unauthenticated'))
    useBooksMock.mockReturnValue({
      data: [{ title: 'Book title', author: 'Author', coverUrl: '' }],
    })
    renderWithProviders(<HomePage />)
    expect(await screen.findByText('Book title')).toBeVisible()
  })
})
