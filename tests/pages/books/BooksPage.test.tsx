import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

describe('BooksPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<BooksPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })

  test('filters books by tab selection', async () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(
      screen.getByRole('tab', { name: 'booksPage.tabs.for_trade' })
    )
    expect(await screen.findByText('1984')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'booksPage.tabs.seeking' }))
    expect(
      await screen.findByText('El pulpo invisible')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('tab', { name: 'booksPage.tabs.for_sale' })
    )
    expect(
      await screen.findByText('Matisse en Bélgica')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'booksPage.tabs.mine' }))
    expect(
      await screen.findByText('Matisse en Bélgica')
    ).toBeInTheDocument()
  })

  test('shows empty state when search yields no results', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.change(
      screen.getByPlaceholderText('booksPage.search_placeholder'),
      {
        target: { value: 'zzzzz' },
      }
    )
    expect(screen.getByText('booksPage.empty.mine')).toBeInTheDocument()
  })
})
