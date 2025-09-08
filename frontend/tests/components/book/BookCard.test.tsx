import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

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
})
