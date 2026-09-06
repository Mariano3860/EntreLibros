import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const books = vi.hoisted(() =>
  Array.from({ length: 11 }, (_, index) => ({
    id: String(index + 1),
    title: `Book ${index + 1}`,
    author: 'EntreLibros Author',
    coverUrl: '',
    condition: 'good',
    status: 'available' as const,
    type: 'offer' as const,
    isForTrade: true,
    isForSale: false,
    isSeeking: false,
    price: null,
  }))
)
const fetchBookRelations = vi.hoisted(() =>
  vi.fn().mockImplementation(({ offset = 0 }: { offset?: number } = {}) => {
    const limit = 5
    const items = books.slice(offset, offset + limit)
    return Promise.resolve({
      items,
      page: {
        limit,
        offset,
        total: books.length,
        hasNext: offset + limit < books.length,
        hasPrevious: offset > 0,
      },
      counts: { all: books.length, trade: books.length, sale: 0, seeking: 0 },
    })
  })
)

vi.mock('@src/utils/runtimeEnv', () => ({ isApiMockMode: () => false }))
vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockResolvedValue({ id: 1, name: 'Reader' }),
}))
vi.mock('@api/books/books.service', () => ({ fetchBookRelations }))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

describe('BooksPage pagination', () => {
  test('moves between personal result pages with the footer controls', async () => {
    renderWithProviders(<BooksPage />)

    expect(
      await screen.findByRole('button', { name: 'Ver Book 1' })
    ).toBeInTheDocument()
    expect(fetchBookRelations).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, offset: 0, tab: 'all' })
    )
    const nextButton = screen.getByRole('button', {
      name: 'booksPage.pagination.next',
    })
    expect(nextButton).not.toBeDisabled()

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'booksPage.pagination.page',
      })[1]
    )

    expect(
      await screen.findByRole('button', { name: 'Ver Book 6' })
    ).toBeInTheDocument()
    expect(fetchBookRelations).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 5, offset: 5, tab: 'all' })
    )
    expect(
      screen.queryByRole('button', { name: 'Ver Book 1' })
    ).not.toBeInTheDocument()

    fireEvent.click(nextButton)
    expect(
      await screen.findByRole('button', { name: 'Ver Book 11' })
    ).toBeInTheDocument()
    await waitFor(() => expect(nextButton).toBeDisabled())
  })
})
