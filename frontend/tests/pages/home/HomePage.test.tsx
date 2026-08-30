import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { HomePage } from '@src/pages/home/HomePage'

import { renderWithProviders } from '../../test-utils'

describe('HomePage', () => {
  test('renders the complete prototype home', async () => {
    renderWithProviders(<HomePage />)

    expect(await screen.findByText(/¡Bienvenido de nuevo/)).toBeVisible()
    expect(screen.getByText('134')).toBeVisible()
    expect(screen.getByText('52')).toBeVisible()
    expect(
      screen.getAllByRole('button', { name: /^Ver (?!todos)/ })
    ).toHaveLength(5)
    expect(screen.getByText('Actividad reciente')).toBeVisible()
  })

  test('navigates to Explore from the hero', async () => {
    renderWithProviders(<HomePage />)
    fireEvent.click(
      await screen.findByRole('button', { name: /Explorar libros/ })
    )
    expect(window.location.pathname).toBe('/')
  })
})
