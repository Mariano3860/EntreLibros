import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

describe('BooksPage', () => {
  test('renders Todos with every catalog book', () => {
    renderWithProviders(<BooksPage />)

    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(5)
  })

  test('keeps Todos greater than Mis libros and filters by text', () => {
    renderWithProviders(<BooksPage />)

    fireEvent.click(screen.getByRole('tab', { name: 'Mis libros' }))
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(2)

    fireEvent.click(screen.getByRole('tab', { name: 'Todos' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar libros' }), {
      target: { value: 'luciérnagas' },
    })
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(1)
  })

  test('opens the real publish modal from the page action', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(screen.getByRole('button', { name: /Publicar un libro/ }))
    expect(screen.getByText('publishBook.title')).toBeVisible()
  })

  test('opens a book detail dialog', () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )
    expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: /Contactar a Lucia/ })
    ).toBeVisible()
  })
})
