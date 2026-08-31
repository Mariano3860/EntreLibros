import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const books = vi.hoisted(() =>
  Array.from({ length: 11 }, (_, index) => ({
    id: String(index + 1),
    title: `Book ${index + 1}`,
    author: 'EntreLibros Author',
    coverUrl: '',
    condition: 'good',
    status: 'available' as const,
    isForTrade: true,
    isForSale: false,
    isSeeking: false,
    price: null,
  }))
)

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

vi.mock('@api/books/books.service', () => ({
  fetchBooks: vi.fn().mockResolvedValue(books),
  fetchBookById: vi.fn(),
}))

vi.mock('@api/books/userBooks.service', () => ({
  fetchUserBooks: vi.fn().mockResolvedValue([]),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

describe('BooksPage pagination', () => {
  test('moves between result pages with the footer controls', async () => {
    renderWithProviders(<BooksPage />)

    expect(
      await screen.findByRole('button', { name: 'Ver Book 1' })
    ).toBeInTheDocument()
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
    expect(
      screen.queryByRole('button', { name: 'Ver Book 1' })
    ).not.toBeInTheDocument()

    fireEvent.click(nextButton)

    expect(
      await screen.findByRole('button', { name: 'Ver Book 11' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver Book 1' })
    ).not.toBeInTheDocument()
    expect(nextButton).toBeDisabled()
  })
})
