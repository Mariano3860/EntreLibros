import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

const fetchBooks = vi.hoisted(() => vi.fn())
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
  test('opens a blank want form from the header action', async () => {
    fetchBooks.mockResolvedValue([])

    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books'],
    })

    fireEvent.click(
      await screen.findByRole('button', { name: 'booksPage.want.open' })
    )

    expect(await screen.findByText('booksPage.want.title')).toBeVisible()
    expect(screen.getByLabelText('booksPage.want.titleLabel')).toHaveValue('')

    createWantBook.mockResolvedValue({ id: 'want-created' })
    const titleInput = screen.getByLabelText('booksPage.want.titleLabel')
    fireEvent.change(titleInput, {
      target: { value: 'Libro buscado desde el encabezado' },
    })
    fireEvent.input(titleInput, {
      target: { value: 'Libro buscado desde el encabezado' },
    })
    await waitFor(() =>
      expect(titleInput).toHaveValue('Libro buscado desde el encabezado')
    )
    const submit = screen.getByRole('button', { name: 'booksPage.want.submit' })
    await waitFor(() => expect(submit).toBeEnabled())
    fireEvent.click(submit)

    await waitFor(() => {
      expect(createWantBook).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'want',
          metadata: expect.objectContaining({
            title: 'Libro buscado desde el encabezado',
          }),
        })
      )
    })
    expect(screen.queryByText('booksPage.want.title')).not.toBeInTheDocument()
  })

  test('applies catalog filters and resets them from the visible panel', async () => {
    fetchBooks.mockResolvedValue([discoveryBook])

    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/trade?page=2'],
    })

    const offerCardButton = await screen.findByRole('button', {
      name: 'Ver Libro de descubrimiento',
    })
    expect(offerCardButton).toBeInTheDocument()
    expect(
      within(offerCardButton.closest('article') as HTMLElement).getAllByRole(
        'button'
      )
    ).toHaveLength(1)

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

  test('renders want listings as searching without offer actions', async () => {
    const seekingBook = {
      ...discoveryBook,
      id: 'seeking-book',
      isForTrade: false,
      isSeeking: true,
    }
    fetchBooks.mockResolvedValue([seekingBook])

    renderWithProviders(<BooksPage />, {
      initialEntries: ['/books/seeking'],
    })

    expect(
      await screen.findByRole('button', { name: 'Ver Libro de descubrimiento' })
    ).toBeInTheDocument()
    const card = screen
      .getByRole('button', { name: 'Ver Libro de descubrimiento' })
      .closest('article')
    expect(card).not.toBeNull()
    expect(
      within(card as HTMLElement).getByText('Lista de deseos')
    ).toBeVisible()
    expect(within(card as HTMLElement).getAllByText('Buscando')).toHaveLength(1)
    expect(within(card as HTMLElement).getAllByRole('button')).toHaveLength(1)
  })
})
