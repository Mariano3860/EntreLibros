import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapPublicationPin,
} from '@src/api/map/map.types'
import { MapCanvas } from '@components/map/MapCanvas/MapCanvas'

import { renderWithProviders } from '../../../test-utils'

const fitBoundsMock = vi.fn()
const zoomInMock = vi.fn()
const zoomOutMock = vi.fn()
const setViewMock = vi.fn()
const flyToMock = vi.fn()
const mapMock = {
  fitBounds: fitBoundsMock,
  getZoom: () => 13,
  setView: setViewMock,
  flyTo: flyToMock,
  zoomIn: zoomInMock,
  zoomOut: zoomOutMock,
}

beforeEach(() => {
  fitBoundsMock.mockClear()
  zoomInMock.mockClear()
  zoomOutMock.mockClear()
  setViewMock.mockClear()
  flyToMock.mockClear()
})

vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="leaflet-map">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    Circle: ({ radius }: { radius: number }) => (
      <div data-testid="radius-circle" data-radius={radius} />
    ),
    Marker: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="user-location-marker">{children}</div>
    ),
    CircleMarker: ({
      children,
      eventHandlers,
      className,
    }: {
      children?: React.ReactNode
      eventHandlers?: { click?: () => void }
      className?: string
    }) => (
      <button
        type="button"
        data-testid={`marker-${className ?? 'default'}`}
        onClick={() => eventHandlers?.click?.()}
      >
        {children}
      </button>
    ),
    Tooltip: ({ children }: { children?: React.ReactNode }) => (
      <span>{children}</span>
    ),
    useMap: () => mapMock,
  }
})

const bbox: MapBoundingBox = {
  north: -34.5,
  south: -34.7,
  east: -58.3,
  west: -58.6,
}

const baseCorner: Omit<MapCornerPin, 'id' | 'name' | 'barrio'> = {
  city: 'Ciudad',
  lat: -34.6,
  lon: -58.4,
  lastSignalAt: new Date().toISOString(),
  photos: [],
  themes: ['Club lector'],
  status: 'active',
}

const corners: MapCornerPin[] = [
  { ...baseCorner, id: 'corner-1', name: 'Corner Norte', barrio: 'Norte' },
  {
    ...baseCorner,
    id: 'corner-2',
    name: 'Corner Sur',
    barrio: 'Sur',
    lat: -34.6005,
    lon: -58.4005,
  },
]

const publications: MapPublicationPin[] = [
  {
    id: 'pub-1',
    cornerId: 'corner-1',
    title: 'Libro 1',
    authors: ['Autora'],
    type: 'offer',
    distanceKm: 0.4,
  },
]

const activity: MapActivityPoint[] = [
  { id: 'act-1', lat: -34.6, lon: -58.4, intensity: 2 },
]

describe('MapCanvas', () => {
  test('renders markers and handles selection', () => {
    const handleSelectPin = vi.fn()

    renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={corners}
        publications={publications}
        activity={activity}
        layers={{ corners: true, publications: true, activity: true }}
        selectedPin={null}
        onSelectPin={handleSelectPin}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
      />
    )

    const cornerMarker = screen
      .getAllByTestId(/marker-/)
      .find((element) =>
        element.getAttribute('data-testid')?.includes('corner')
      )
    expect(cornerMarker).toBeDefined()
    fireEvent.click(cornerMarker as HTMLElement)

    expect(handleSelectPin).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'corner',
        data: expect.objectContaining({ id: 'corner-1' }),
      })
    )
    expect(fitBoundsMock).toHaveBeenCalled()
  })

  test('shows activity markers, loading overlay and empty state', () => {
    const { rerender } = renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={[]}
        publications={[]}
        activity={activity}
        layers={{ corners: false, publications: false, activity: true }}
        selectedPin={null}
        onSelectPin={vi.fn()}
        isLoading
        isFetching
        isEmpty={false}
      />
    )

    expect(screen.getByText('map.status.loading')).toBeInTheDocument()
    expect(screen.getAllByTestId(/marker-/)).toHaveLength(activity.length)

    rerender(
      <MapCanvas
        bbox={bbox}
        corners={[]}
        publications={[]}
        activity={activity}
        layers={{ corners: false, publications: false, activity: false }}
        selectedPin={null}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty
      />
    )

    expect(screen.getByText('map.empty.description')).toBeInTheDocument()
  })

  test('centers the map on the selected corner', () => {
    renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={corners}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: false, activity: false }}
        selectedPin={{ type: 'corner', data: corners[1] }}
        focusRequest={1}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
      />
    )

    expect(flyToMock).toHaveBeenCalledWith(
      [corners[1].lat, corners[1].lon],
      15,
      { animate: true, duration: 0.6 }
    )
  })

  test('does not refocus when the selected pin changes without a focus request', () => {
    const { rerender } = renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={corners}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: false, activity: false }}
        selectedPin={{ type: 'corner', data: corners[0] }}
        focusRequest={1}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
      />
    )

    const initialFocusCalls = flyToMock.mock.calls.length

    rerender(
      <MapCanvas
        bbox={bbox}
        corners={corners}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: false, activity: false }}
        selectedPin={{ type: 'corner', data: corners[1] }}
        focusRequest={1}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
      />
    )

    expect(flyToMock).toHaveBeenCalledTimes(initialFocusCalls)
  })

  test('renders a location pin over the approximate location area', () => {
    renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={[]}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: true, activity: true }}
        selectedPin={null}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
        userLocation={{ latitude: -34.6, longitude: -58.4 }}
      />
    )

    expect(screen.getByTestId('user-location-marker')).toBeInTheDocument()
  })

  test('renders the geographic radius around the approximate location', () => {
    renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={[]}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: true, activity: true }}
        selectedPin={null}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
        userLocation={{ latitude: -34.6, longitude: -58.4 }}
        radiusKm={5}
      />
    )

    expect(screen.getByTestId('radius-circle')).toHaveAttribute(
      'data-radius',
      '5000'
    )
  })

  test('provides functional zoom and recenter controls', () => {
    renderWithProviders(
      <MapCanvas
        bbox={bbox}
        corners={corners}
        publications={[]}
        activity={[]}
        layers={{ corners: true, publications: false, activity: false }}
        selectedPin={null}
        onSelectPin={vi.fn()}
        isLoading={false}
        isFetching={false}
        isEmpty={false}
        userLocation={{ latitude: -34.6, longitude: -58.4 }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Alejar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Centrar mapa' }))

    expect(zoomInMock).toHaveBeenCalledOnce()
    expect(zoomOutMock).toHaveBeenCalledOnce()
    expect(setViewMock).toHaveBeenCalledWith([-34.6, -58.4], 13, {
      animate: true,
    })
  })
})
