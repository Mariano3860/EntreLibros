import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const fetchBooks = vi.hoisted(() => vi.fn())
const toggleBookInterest = vi.hoisted(() => vi.fn())
const createWantBook = vi.hoisted(() => vi.fn())

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockResolvedValue({ id: 1, name: 'Reader' }),
}))

vi.mock('@api/books/books.service', () => ({
  fetchBooks,
  fetchBookById: vi.fn(),
}))

vi.mock('@api/books/bookInteractions.service', () => ({
  createWantBook,
  toggleBookInterest,
}))

vi.mock('@api/books/userBooks.service', () => ({
  fetchUserBooks: vi.fn().mockResolvedValue([]),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

const discoveryBook = {
  id: 'discovery-book',
  title: 'Libro de descubrimiento',
  author: 'Autora de prueba',
  coverUrl: '',
  condition: 'good',
  status: 'available' as const,
  isForTrade: true,
  isForSale: false,
  isSeeking: false,
  price: null,
  isInterested: false,
}

describe('BooksPage discovery interactions', () => {
  test('applies catalog filters and resets them from the visible panel', async () => {
    fetchBooks.mockResolvedValue([discoveryBook])

    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/trade?page=2'],
    })

    expect(
      await screen.findByRole('button', { name: 'Ver Libro de descubrimiento' })
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /booksPage.filters.button/ })
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'booksPage.filters.condition' }),
      { target: { value: 'good' } }
    )

    await waitFor(() => {
      expect(fetchBooks).toHaveBeenLastCalledWith(
        expect.objectContaining({
          condition: 'good',
          type: 'offer',
          trade: true,
        })
      )
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'booksPage.filters.active'
    )

    fireEvent.click(
      screen.getAllByRole('button', { name: 'booksPage.filters.reset' })[0]
    )

    expect(
      screen.getByRole('combobox', { name: 'booksPage.filters.condition' })
    ).toHaveValue('')
    await waitFor(() => {
      expect(fetchBooks).toHaveBeenLastCalledWith(
        expect.objectContaining({ condition: undefined, trade: true })
      )
    })
  })

  test('toggles interest and opens the want modal with the selected book', async () => {
    fetchBooks.mockResolvedValue([discoveryBook])
    toggleBookInterest.mockResolvedValue({
      listingId: discoveryBook.id,
      interested: true,
    })

    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/trade'],
    })

    await screen.findByRole('button', { name: 'Ver Libro de descubrimiento' })
    const interestButton = await screen.findByRole('button', {
      name: 'booksPage.card.interest',
    })

    fireEvent.click(interestButton)

    await waitFor(() => {
      expect(toggleBookInterest).toHaveBeenCalledWith(discoveryBook.id)
      expect(interestButton).toHaveAttribute('aria-pressed', 'true')
    })

    fireEvent.click(screen.getByRole('button', { name: 'booksPage.card.want' }))

    expect(screen.getByLabelText('booksPage.want.titleLabel')).toHaveValue(
      discoveryBook.title
    )
    expect(screen.getByText('booksPage.want.title')).toBeVisible()

    createWantBook.mockResolvedValue({ id: 'want-listing' })
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.want.submit' })
    )

    await waitFor(() => {
      expect(createWantBook).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'want',
          metadata: expect.objectContaining({
            title: discoveryBook.title,
            author: discoveryBook.author,
          }),
        })
      )
      expect(screen.queryByText('booksPage.want.title')).not.toBeInTheDocument()
    })
  })
})
