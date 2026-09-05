import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useLocation } from 'react-router-dom'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '@src/pages/books/BooksPage'

import { renderWithProviders } from '../../test-utils'

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
  test('renders the book sections in one accessible horizontal tablist', () => {
    renderWithProviders(<BooksPage />)

    const tablist = screen.getByRole('tablist', { name: 'Tipos de libros' })

    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(3)
    expect(
      screen.queryByRole('tab', { name: 'Mis libros' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: 'Buscando' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Buscando')).not.toBeInTheDocument()
  })

  test('normalizes a visitor seeking URL to the public books catalog', async () => {
    renderWithProviders(
      <>
        <BooksPage />
        <LocationProbe />
      </>,
      { initialEntries: ['/books/seeking?type=want&page=2'] }
    )

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/books')
      expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
    expect(
      screen.queryByRole('tab', { name: 'Buscando' })
    ).not.toBeInTheDocument()
  })

  test('renders Todos with the public catalog for visitors', () => {
    renderWithProviders(<BooksPage />)

    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'Ver Ecos del Viento Norte' })
    ).toBeVisible()
  })

  test('keeps public books out of Todos while public tabs can explore them', () => {
    renderWithProviders(<BooksPage />)

    fireEvent.click(
      screen.getByRole('tab', { name: 'Disponibles para intercambio' })
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar libros' }), {
      target: { value: 'Ecos' },
    })
    expect(screen.getAllByRole('button', { name: /^Ver / })).toHaveLength(1)
  })

  test('gates the publish action for a visitor', async () => {
    renderWithProviders(<BooksPage />)
    fireEvent.click(screen.getByRole('button', { name: /Publicar un libro/ }))
    expect(await screen.findByRole('dialog')).toBeVisible()
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
    const contact = screen.getByRole('button', { name: 'bookDetail.contact' })
    expect(contact).toBeVisible()
    fireEvent.click(contact)
    expect(await screen.findByText('auth.required.title')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.close' }))
    expect(
      screen.queryByRole('button', { name: 'bookDetail.close' })
    ).not.toBeInTheDocument()
  })
})
