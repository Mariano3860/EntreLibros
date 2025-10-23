import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapPublicationPin,
} from '@src/api/map/map.types'
import { MapCanvas } from '@src/pages/map/components/MapCanvas/MapCanvas'

import { renderWithProviders } from '../../../test-utils'

const fitBoundsMock = vi.fn()

beforeEach(() => {
  fitBoundsMock.mockClear()
})

vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="leaflet-map">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
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
    useMap: () => ({
      fitBounds: fitBoundsMock,
    }),
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
})
