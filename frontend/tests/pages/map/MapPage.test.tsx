import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { MapPage } from '@src/pages/map/MapPage'

import { renderWithProviders } from '../../test-utils'

describe('MapPage', () => {
  test('requests location automatically and renders the expanded map', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: -34.58, longitude: -58.42 } })
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    renderWithProviders(<MapPage />)

    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalled())
    expect(screen.getByRole('img', { name: /Mapa oscuro/ })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Tu ubicación aproximada' })
    ).toBeVisible()

    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else Reflect.deleteProperty(navigator, 'geolocation')
  })

  test('changes distance, categories and selected corner', () => {
    renderWithProviders(<MapPage />)

    fireEvent.change(screen.getByRole('slider', { name: 'Distancia' }), {
      target: { value: '7' },
    })
    expect(screen.getByText('7 km')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Bibliotecas' }))
    expect(screen.getByRole('button', { name: 'Bibliotecas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Biblioteca de Palermo' })
    )
    expect(
      screen.getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
  })

  test('keeps Buenos Aires fallback when location is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error()) },
    })
    renderWithProviders(<MapPage />)
    expect(await screen.findByText(/Mostramos Buenos Aires/)).toBeVisible()
  })
})
