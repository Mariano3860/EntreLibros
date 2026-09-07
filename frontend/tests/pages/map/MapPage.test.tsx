import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type {
  MapBoundingBox,
  MapCornerPin,
  MapPin,
} from '@src/api/map/map.types'

const { mapCanvasRender, viewportHandler } = vi.hoisted(() => ({
  mapCanvasRender: vi.fn(),
  viewportHandler: {
    current: null as ((bbox: MapBoundingBox) => void) | null,
  },
}))

vi.mock('@components/map/MapCanvas/MapCanvas', () => ({
  MapCanvas: ({
    corners,
    selectedPin,
    userLocation,
    focusRequest,
    radiusKm,
    onSelectPin,
    bbox,
    onViewportChange,
  }: {
    corners: MapCornerPin[]
    selectedPin: MapPin | null
    userLocation?: { latitude: number; longitude: number } | null
    focusRequest: number
    radiusKm?: number | null
    onSelectPin: (pin: MapPin) => void
    bbox: MapBoundingBox
    onViewportChange?: (bbox: MapBoundingBox) => void
  }) => {
    viewportHandler.current = onViewportChange ?? null
    mapCanvasRender({
      bbox,
      selectedPin,
      userLocation,
      focusRequest,
      radiusKm,
    })
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
          <button type="button" aria-label="Tu ubicación aproximada" />
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

const locationButton = () =>
  screen.getByRole('button', { name: 'map.filters.locateMe' })
const radiusSlider = () => screen.getByRole('slider', { name: /Radio geogr/ })
const selectedCornerButton = () =>
  screen.getByRole('button', { name: 'Pin del mapa: Biblioteca de Palermo' })

describe('MapPage', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchMe.mockRejectedValue(new Error('unauthenticated'))
    mapCanvasRender.mockClear()
    viewportHandler.current = null
  })

  test('renders the map as the primary region without requesting visitor location', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: -34.58, longitude: -58.42 } })
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    try {
      renderWithProviders(<MapPage />)

      expect(
        await screen.findByRole('region', {
          name: 'map.exploration.mapLabel',
        })
      ).toBeVisible()
      expect(getCurrentPosition).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('button', { name: 'Tu ubicación aproximada' })
      ).not.toBeInTheDocument()
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })

  test('changes radius and category while keeping one selected card', () => {
    renderWithProviders(<MapPage />)

    fireEvent.change(radiusSlider(), { target: { value: '1' } })
    expect(radiusSlider()).toHaveValue('1')
    expect(screen.getByRole('button', { name: 'Comunidad' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Comunidad' }))
    expect(screen.getByRole('button', { name: 'Comunidad' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(selectedCornerButton())

    const card = screen.getByRole('article', {
      name: 'Biblioteca de Palermo',
    })
    expect(
      within(card).getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
    expect(
      screen.getAllByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toHaveLength(1)
  })

  test('opens details inside the single selected card', () => {
    renderWithProviders(<MapPage />)
    fireEvent.click(selectedCornerButton())

    const card = screen.getByRole('article', {
      name: 'Biblioteca de Palermo',
    })
    fireEvent.click(
      within(card).getByRole('button', { name: 'map.cta.openCorner' })
    )

    expect(within(card).getByLabelText('map.cornerDetail.title')).toBeVisible()
    expect(
      screen.getAllByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toHaveLength(1)
  })

  test('selects a corner from a map pin and exposes a clear detail action', () => {
    renderWithProviders(<MapPage />)
    fireEvent.click(selectedCornerButton())

    const card = screen.getByRole('article', {
      name: 'Biblioteca de Palermo',
    })
    expect(card.querySelector('img')).toHaveAttribute(
      'src',
      '/prototype/reading-room.svg'
    )
    expect(
      within(card).getByRole('button', { name: 'map.cta.openCorner' })
    ).toBeVisible()
  })

  test('keeps the map focus request stable after locating the user', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: -34.58, longitude: -58.42 } })
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    try {
      mapCanvasRender.mockClear()
      renderWithProviders(<MapPage />)
      const focusRequestBeforeLocate = mapCanvasRender.mock.calls.at(-1)?.[0]
        .focusRequest as number

      fireEvent.click(locationButton())
      await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1))

      expect(mapCanvasRender.mock.calls.at(-1)?.[0].focusRequest).toBe(
        focusRequestBeforeLocate
      )
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })

  test('opens the corner received from the community map', () => {
    renderWithProviders(<MapPage />, {
      initialEntries: ['/map?corner=biblioteca-palermo&radius=5'],
    })

    expect(
      screen.getByRole('heading', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
    expect(radiusSlider()).toHaveAttribute('aria-valuetext', '5 km')
  })

  test('keeps the selected radius after locating the user', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) =>
          success({ coords: { latitude: -34.58, longitude: -58.42 } })
        ),
      },
    })

    try {
      renderWithProviders(<MapPage />)
      fireEvent.click(locationButton())
      await waitFor(() =>
        expect(mapCanvasRender.mock.calls.at(-1)?.[0].userLocation).toEqual({
          latitude: -34.58,
          longitude: -58.42,
        })
      )

      fireEvent.change(radiusSlider(), { target: { value: '2' } })
      await waitFor(() =>
        expect(mapCanvasRender.mock.calls.at(-1)?.[0].radiusKm).toBe(30)
      )
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })

  test('shows the fallback notice when location is denied', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error()) },
    })

    try {
      renderWithProviders(<MapPage />)
      fireEvent.click(locationButton())
      expect(
        await screen.findByText('map.location.deniedWithoutProfile')
      ).toBeVisible()
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })

  test('uses the latest bbox after rapid pan and zoom updates', async () => {
    renderWithProviders(<MapPage />)

    const pannedBbox: MapBoundingBox = {
      north: -34.4,
      south: -34.6,
      east: -58.1,
      west: -58.4,
    }
    const zoomedBbox: MapBoundingBox = {
      north: -34.48,
      south: -34.54,
      east: -58.2,
      west: -58.3,
    }

    await waitFor(() => expect(viewportHandler.current).not.toBeNull())
    act(() => {
      viewportHandler.current?.(pannedBbox)
      viewportHandler.current?.(zoomedBbox)
    })

    await waitFor(() =>
      expect(mapCanvasRender.mock.calls.at(-1)?.[0].bbox).toEqual(zoomedBbox)
    )
  })

  test('can close the selected card and reopen it from activity', () => {
    renderWithProviders(<MapPage />)
    const card = screen.getByRole('article')
    fireEvent.click(
      within(card).getByRole('button', { name: 'map.selection.close' })
    )
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    fireEvent.click(
      within(screen.getByRole('complementary')).getByRole('button', {
        name: /Biblioteca de Palermo/,
      })
    )
    expect(
      screen.getByRole('article', { name: 'Biblioteca de Palermo' })
    ).toBeVisible()
  })

  test('toggles exploration layers, availability, activity and panel visibility', () => {
    renderWithProviders(<MapPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    )
    expect(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    ).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    )
    expect(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    ).toHaveAttribute('aria-pressed', 'true')

    const openNow = screen.getByRole('checkbox', {
      name: 'map.filters.openNow',
    })
    fireEvent.click(openNow)
    expect(openNow).toBeChecked()

    const activity = screen.getByRole('checkbox', {
      name: 'map.exploration.activityVisible',
    })
    fireEvent.click(activity)
    expect(activity).not.toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'map.filters.hide' }))
    expect(
      screen.getByRole('button', { name: 'map.filters.show' })
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'map.filters.show' }))
    expect(
      screen.getByRole('button', { name: 'map.filters.hide' })
    ).toBeVisible()
  })
})
