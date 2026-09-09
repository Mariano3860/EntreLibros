import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useLocation } from 'react-router-dom'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { HomePage } from '@src/pages/home/HomePage'

import { renderWithProviders } from '../../test-utils'

const LocationProbe = () => {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

describe('HomePage', () => {
  test('renders the complete home', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationProbe />
      </>
    )

    expect(await screen.findByText(/Encontr/)).toBeVisible()
    expect(screen.getByText('134')).toBeVisible()
    expect(screen.getByText('52')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Ver Ecos del Viento Norte' })
    ).toBeVisible()
    expect(screen.queryByText(/Mi actividad/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Mis libros/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver más recomendaciones' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Actividad reciente')).toBeVisible()
  })

  test('navigates visitors to the community from the hero', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationProbe />
      </>
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'home.explore_community' })
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/community')
  })

  test('opens the selected home book in a detail modal', async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )

    expect(
      await screen.findByRole('button', { name: 'bookDetail.close' })
    ).toBeVisible()
    expect(await screen.findByText('bookDetail.offer.title')).toBeVisible()
  })
})
