import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { BookCard } from '@src/components/book/BookCard'

import { renderWithProviders } from '../../test-utils'

describe('BookCard', () => {
  test('renders full info with badges and trade preferences', () => {
    renderWithProviders(
      <BookCard
        title="Dune"
        author="Frank Herbert"
        coverUrl="https://example.com/dune.jpg"
        condition="nuevo"
        status="available"
        isForSale
        price={42}
        isForTrade
        tradePreferences={['A', 'B', 'C', 'D']}
        isSeeking
      />
    )

    expect(screen.getByText('Dune')).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(screen.getByAltText('booksPage.cover_alt')).toBeInTheDocument()
    expect(screen.getByText('booksPage.status.available')).toBeInTheDocument()
    expect(screen.getByText('nuevo')).toBeInTheDocument()
    expect(screen.getByText('booksPage.badge.for_sale')).toBeInTheDocument()
    expect(
      screen.getByText((content) =>
        content.startsWith('booksPage.badge.for_trade')
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText((content) => content.includes('A, B, C +1'))
    ).toBeInTheDocument()
    expect(screen.getByText('booksPage.badge.seeking')).toBeInTheDocument()
  })

  test('renders condition label for known condition values', () => {
    renderWithProviders(
      <BookCard
        title="Test Book"
        author="Test Author"
        coverUrl="https://example.com/test.jpg"
        condition="very_good"
        status="available"
      />
    )

    expect(
      screen.getByText('publishBook.preview.condition.very_good')
    ).toBeInTheDocument()
  })

  test('handles onClick with keyboard events', () => {
    const onClick = vi.fn()
    renderWithProviders(
      <BookCard
        title="Test Book"
        author="Test Author"
        coverUrl="https://example.com/test.jpg"
        condition="good"
        status="available"
        onClick={onClick}
      />
    )

    const card = screen.getByRole('button')

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)

    // Test other key (should not trigger)
    fireEvent.keyDown(card, { key: 'a' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
