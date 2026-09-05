import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { MapCornerPin, MapPin } from '@src/api/map/map.types'

const mapCanvasRender = vi.hoisted(() => vi.fn())

vi.mock('@components/map/MapCanvas/MapCanvas', () => ({
  MapCanvas: ({
    corners,
    selectedPin,
    userLocation,
    focusRequest,
    radiusKm,
    onSelectPin,
  }: {
    corners: MapCornerPin[]
    selectedPin: MapPin | null
    userLocation?: { latitude: number; longitude: number } | null
    focusRequest: number
    radiusKm?: number | null
    onSelectPin: (pin: MapPin) => void
  }) => {
    mapCanvasRender({ selectedPin, userLocation, focusRequest, radiusKm })
    return (
      <div data-testid="map-canvas">
        {corners.map((corner) => (
          <button
            key={corner.id}
            type="button"
            aria-label={`Pin del mapa: ${corner.name}`}
            onClick={() => onSelectPin({ type: 'corner', data: corner })}
          />
        ))}
        {userLocation ? (
          <button type="button" aria-label={'Tu ubicaci\u00f3n aproximada'} />
        ) : null}
      </div>
    )
  },
}))

const { fetchMe } = vi.hoisted(() => ({
  fetchMe: vi.fn(),
}))

vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))

import { MapPage } from '@src/pages/map/MapPage'

import { renderWithProviders } from '../../test-utils'

describe('MapPage', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchMe.mockRejectedValue(new Error('unauthenticated'))
  })

  test('does not request location automatically for visitors', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: -34.58, longitude: -58.42 } })
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    renderWithProviders(<MapPage />)

    await screen.findByRole('img', { name: /Mapa oscuro/ })
    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(screen.getByRole('img', { name: /Mapa oscuro/ })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Tu ubicación aproximada' })
    ).not.toBeInTheDocument()

    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else Reflect.deleteProperty(navigator, 'geolocation')
  })

  test('changes distance, categories and selected corner', () => {
    renderWithProviders(<MapPage />)

    fireEvent.change(screen.getByRole('slider', { name: 'Radio geográfico' }), {
      target: { value: '1' },
    })
    expect(screen.getByText('Hasta 5 km')).toBeVisible()
    expect(
      screen.getByRole('slider', { name: 'Radio geográfico' })
    ).toHaveValue('1')

    fireEvent.click(screen.getByRole('button', { name: 'Bibliotecas' }))
    expect(screen.getByRole('button', { name: 'Bibliotecas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Biblioteca de Palermo' })
    )
    expect(
      screen.getAllByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toHaveLength(2)
  })

  test('opens the selected corner details from the side list', () => {
    renderWithProviders(<MapPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Biblioteca de Palermo' })
    )

    expect(screen.getByRole('article').querySelector('img')).toHaveAttribute(
      'src',
      '/prototype/reading-room.svg'
    )

    const panel = screen.getAllByRole('complementary')[1]
    expect(panel).toBeDefined()
    expect(
      within(panel).getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
    expect(panel.textContent).toContain('Buenos Aires')
    expect(
      within(panel).queryByTestId('corner-edit-button')
    ).not.toBeInTheDocument()
  })

  test('opens the selected corner details from a map pin', () => {
    renderWithProviders(<MapPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Pin del mapa: Biblioteca de Palermo',
      })
    )

    const panel = screen.getAllByRole('complementary')[1]
    expect(
      within(panel).getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
  })

  test('centers the selected corner from the detail card action', () => {
    mapCanvasRender.mockClear()
    renderWithProviders(<MapPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Biblioteca de Palermo' })
    )
    const selectedPinBeforeAction = mapCanvasRender.mock.calls.at(-1)?.[0]
      .selectedPin as MapPin

    fireEvent.click(screen.getByRole('button', { name: 'Ver rinc\u00f3n' }))

    const selectedPinAfterAction = mapCanvasRender.mock.calls.at(-1)?.[0]
      .selectedPin as MapPin
    expect(selectedPinAfterAction).toEqual(
      expect.objectContaining({
        type: 'corner',
        data: expect.objectContaining({ id: 'biblioteca-palermo' }),
      })
    )
    expect(selectedPinAfterAction).not.toBe(selectedPinBeforeAction)
  })

  test('keeps the map focused on the user after using Mi ubicación', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: -34.58, longitude: -58.42 } })
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    mapCanvasRender.mockClear()
    renderWithProviders(<MapPage />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Biblioteca de Palermo' })
    )
    const focusRequestBeforeLocate = mapCanvasRender.mock.calls.at(-1)?.[0]
      .focusRequest as number

    fireEvent.click(screen.getByRole('button', { name: /Mi ubicación/ }))
    await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1))

    const focusRequestAfterLocate = mapCanvasRender.mock.calls.at(-1)?.[0]
      .focusRequest as number
    expect(focusRequestAfterLocate).toBe(focusRequestBeforeLocate)

    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else Reflect.deleteProperty(navigator, 'geolocation')
  })

  test('opens the corner received from the community map', () => {
    renderWithProviders(<MapPage />, {
      initialEntries: ['/map?corner=biblioteca-palermo&radius=5'],
    })

    expect(
      screen.getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
    expect(screen.getByText('5 km')).toBeVisible()
  })

  test('keeps the selected radius and sends it to the map after locating', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) =>
          success({ coords: { latitude: -34.58, longitude: -58.42 } })
        ),
      },
    })

    mapCanvasRender.mockClear()
    renderWithProviders(<MapPage />)
    fireEvent.click(screen.getByRole('button', { name: /Mi ubicación/ }))
    await waitFor(() =>
      expect(mapCanvasRender.mock.calls.at(-1)?.[0].userLocation).toEqual({
        latitude: -34.58,
        longitude: -58.42,
      })
    )

    fireEvent.change(screen.getByRole('slider', { name: 'Radio geográfico' }), {
      target: { value: '2' },
    })

    await waitFor(() =>
      expect(mapCanvasRender.mock.calls.at(-1)?.[0].radiusKm).toBe(30)
    )

    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else Reflect.deleteProperty(navigator, 'geolocation')
  })

  test('keeps Buenos Aires fallback when location is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error()) },
    })
    renderWithProviders(<MapPage />)
    fireEvent.click(screen.getByRole('button', { name: /Mi ubicación/ }))
    expect(await screen.findByText(/Mostramos Buenos Aires/)).toBeVisible()
  })

  test('explains that distance order is unavailable when geolocation is absent', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Reflect.deleteProperty(navigator, 'geolocation')

    try {
      renderWithProviders(<MapPage />)
      fireEvent.click(screen.getByRole('button', { name: /Mi ubicación/ }))
      expect(await screen.findByText(/sin ordenar por distancia/)).toBeVisible()
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
    }
  })
})
