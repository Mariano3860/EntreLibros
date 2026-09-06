import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useLocation } from 'react-router-dom'

const fetchMe = vi.hoisted(() => vi.fn())
const fetchBookRelations = vi.hoisted(() => vi.fn())

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))
vi.mock('@api/books/books.service', () => ({
  fetchBookRelations,
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

const relationBook = {
  id: 'own-trade-1',
  title: 'Dune',
  author: 'Frank Herbert',
  coverUrl: '',
  condition: 'good',
  status: 'available' as const,
  type: 'offer' as const,
  isForTrade: true,
  isForSale: false,
  isSeeking: false,
  price: null,
  ownerId: '1',
  ownerName: 'Reader',
}

const relationPage = (items = [relationBook]) => ({
  items,
  page: {
    limit: 5,
    offset: 0,
    total: items.length,
    hasNext: false,
    hasPrevious: false,
  },
  counts: { all: items.length, trade: items.length, sale: 0, seeking: 0 },
})

const LocationProbe = () => {
  const location = useLocation()
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  )
}

describe('BooksPage', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchMe.mockResolvedValue({ id: 1, name: 'Reader' })
    fetchBookRelations.mockReset()
    fetchBookRelations.mockResolvedValue(relationPage())
  })

  test('renders exactly the four personal relation tabs', async () => {
    renderWithProviders(<BooksPage />)

    const tablist = await screen.findByRole('tablist', {
      name: 'booksPage.tabs.label',
    })

    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(4)
    expect(
      screen.queryByRole('tab', { name: 'Mis libros' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'booksPage.tabs.all' })
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      await screen.findByRole('button', { name: 'Ver Dune' })
    ).toBeVisible()
  })

  test('normalizes the legacy mine URL to Todos', async () => {
    renderWithProviders(
      <>
        <BooksPage />
        <LocationProbe />
      </>,
      { initialEntries: ['/books/mine'] }
    )

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/books')
    )
    await waitFor(() =>
      expect(fetchBookRelations).toHaveBeenCalledWith(
        expect.objectContaining({ tab: 'all' })
      )
    )
  })

  test('does not query or render public books for a visitor', async () => {
    fetchMe.mockRejectedValueOnce(new Error('unauthenticated'))

    renderWithProviders(<BooksPage />)

    await waitFor(() => expect(fetchMe).toHaveBeenCalled())
    expect(fetchBookRelations).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Ver Dune' })
    ).not.toBeInTheDocument()
  })

  test('changes tab and keeps the selected tab in the URL', async () => {
    renderWithProviders(
      <>
        <BooksPage />
        <LocationProbe />
      </>,
      { initialEntries: ['/books'] }
    )

    fireEvent.click(screen.getByRole('tab', { name: 'booksPage.tabs.seeking' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/books/seeking')
    )
    await waitFor(() =>
      expect(fetchBookRelations).toHaveBeenLastCalledWith(
        expect.objectContaining({ tab: 'seeking' })
      )
    )
  })

  test('shows a contextual empty state for each personal relation tab', async () => {
    fetchBookRelations.mockImplementation(async ({ tab }: { tab: string }) => ({
      items: [],
      page: {
        limit: 5,
        offset: 0,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      },
      counts: { all: 0, trade: 0, sale: 0, seeking: 0 },
      tab,
    }))

    renderWithProviders(<BooksPage />)

    expect(await screen.findByText('booksPage.empty.all')).toBeVisible()
    for (const tab of [
      'booksPage.tabs.for_trade',
      'booksPage.tabs.for_sale',
      'booksPage.tabs.seeking',
    ]) {
      fireEvent.click(screen.getByRole('tab', { name: tab }))
      await waitFor(() => {
        expect(
          screen.getByText(
            tab === 'booksPage.tabs.for_trade'
              ? 'booksPage.empty.trade'
              : tab === 'booksPage.tabs.for_sale'
                ? 'booksPage.empty.sale'
                : 'booksPage.empty.seeking'
          )
        ).toBeVisible()
      })
    }
  })
})
