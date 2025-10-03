import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapPublicationPin,
} from '@src/api/map/map.types'
import { MapCanvas } from '@src/pages/map/components/MapCanvas/MapCanvas'

import { renderWithProviders } from '../../../test-utils'

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
  test('expands clusters and selects pins', async () => {
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

    const clusterButton = await screen.findByRole('button', {
      name: 'map.cluster.more',
    })
    fireEvent.click(clusterButton)

    const cornerButton = await screen.findByRole('button', {
      name: 'Corner Norte',
    })
    fireEvent.click(cornerButton)

    expect(handleSelectPin).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'corner',
        data: expect.objectContaining({ id: 'corner-1' }),
      })
    )
  })

  test('shows heat layer, loading overlay and empty state', () => {
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
    expect(screen.getByTestId('heat-layer')).toBeInTheDocument()

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

    expect(screen.queryByTestId('heat-layer')).not.toBeInTheDocument()
    expect(screen.getByText('map.empty.description')).toBeInTheDocument()
  })
})
