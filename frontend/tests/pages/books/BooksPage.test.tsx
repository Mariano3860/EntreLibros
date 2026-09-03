import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

describe('BooksPage', () => {
  test('renders the book sections in one accessible horizontal tablist', () => {
    renderWithProviders(<BooksPage />)

    const tablist = screen.getByRole('tablist', { name: 'Tipos de libros' })

    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(5)
  })

  test('renders Todos with the user books', () => {
    renderWithProviders(<BooksPage />)

    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'Ver El nombre del viento' })
    ).toBeVisible()
  })

  test('keeps public books out of Todos while public tabs can explore them', () => {
    renderWithProviders(<BooksPage />)

    fireEvent.click(screen.getByRole('tab', { name: 'Mis libros' }))
    expect(
      screen.getByRole('button', { name: 'Ver El nombre del viento' })
    ).toBeVisible()

    fireEvent.click(
      screen.getByRole('tab', { name: 'Disponibles para intercambio' })
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar libros' }), {
      target: { value: 'Ecos' },
    })
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(1)
  })

  test('opens the real publish modal from the page action', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(screen.getByRole('button', { name: /Publicar un libro/ }))
    expect(screen.getByText('publishBook.title')).toBeVisible()
  })

  test('opens the people search without changing the publications route', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.personSearch.open' })
    )
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'booksPage.personSearch.title' })
    ).toBeVisible()
  })

  test('opens a book detail dialog', async () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(
      screen.getByRole('tab', { name: 'Disponibles para intercambio' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )
    expect(
      screen.getByRole('button', { name: 'bookDetail.close' })
    ).toBeVisible()
    expect(await screen.findByText('bookDetail.offer.title')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /Contactar a Lucia/ })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.close' }))
    expect(
      screen.queryByRole('button', { name: 'bookDetail.close' })
    ).not.toBeInTheDocument()
  })
})
