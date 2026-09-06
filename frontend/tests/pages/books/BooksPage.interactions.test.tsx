import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const fetchMe = vi.hoisted(() => vi.fn())
const fetchBookRelations = vi.hoisted(() => vi.fn())
const createWantBook = vi.hoisted(() => vi.fn())

vi.mock('@src/utils/runtimeEnv', () => ({ isApiMockMode: () => false }))
vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))
vi.mock('@api/books/books.service', () => ({ fetchBookRelations }))
vi.mock('@api/books/bookInteractions.service', () => ({ createWantBook }))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

const discoveryBook = {
  id: 'discovery-book',
  title: 'Libro de descubrimiento',
  author: 'Autora de prueba',
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

const relationPage = (items = [discoveryBook]) => ({
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

describe('BooksPage relation interactions', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchMe.mockResolvedValue({ id: 1, name: 'Reader' })
    fetchBookRelations.mockReset()
    fetchBookRelations.mockResolvedValue(relationPage())
    createWantBook.mockReset()
  })

  test('opens a want form from the header action and creates a demand', async () => {
    renderWithProviders(<BooksPage />, { initialEntries: ['/books'] })

    fireEvent.click(
      await screen.findByRole('button', { name: 'booksPage.want.open' })
    )
    expect(await screen.findByText('booksPage.want.title')).toBeVisible()

    createWantBook.mockResolvedValue({ id: 'want-created' })
    const titleInput = screen.getByLabelText('booksPage.want.titleLabel')
    fireEvent.change(titleInput, {
      target: { value: 'Libro buscado desde el encabezado' },
    })
    const submit = screen.getByRole('button', { name: 'booksPage.want.submit' })
    fireEvent.click(submit)

    await waitFor(() =>
      expect(createWantBook).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'want',
          metadata: expect.objectContaining({
            title: 'Libro buscado desde el encabezado',
          }),
        })
      )
    )
    expect(screen.queryByText('booksPage.want.title')).not.toBeInTheDocument()
  })

  test('applies personal filters and resets them from the visible panel', async () => {
    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/trade?page=2'],
    })

    expect(
      await screen.findByRole('button', { name: 'Ver Libro de descubrimiento' })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: /booksPage.filters.button/ })
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'booksPage.filters.condition' }),
      { target: { value: 'good' } }
    )

    await waitFor(() =>
      expect(fetchBookRelations).toHaveBeenLastCalledWith(
        expect.objectContaining({
          tab: 'trade',
          condition: 'good',
          trade: true,
        })
      )
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'booksPage.filters.active'
    )

    fireEvent.click(
      screen.getAllByRole('button', { name: 'booksPage.filters.reset' })[0]
    )
    expect(
      screen.getByRole('combobox', { name: 'booksPage.filters.condition' })
    ).toHaveValue('')
    await waitFor(() =>
      expect(fetchBookRelations).toHaveBeenLastCalledWith(
        expect.objectContaining({ tab: 'trade', condition: undefined })
      )
    )
  })

  test('does not query personal relations when the session is absent', async () => {
    fetchMe.mockRejectedValueOnce(new Error('unauthenticated'))

    renderWithProviders(<BooksPage />)

    await waitFor(() => expect(fetchMe).toHaveBeenCalled())
    expect(fetchBookRelations).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Ver Libro de descubrimiento' })
    ).not.toBeInTheDocument()
  })
})
