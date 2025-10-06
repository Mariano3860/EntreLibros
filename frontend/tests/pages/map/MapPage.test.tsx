import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type {
  MapCornerPin,
  MapPin,
  MapPublicationPin,
} from '@src/api/map/map.types'
import { MapPage } from '@src/pages/map/MapPage'
import * as analytics from '@src/utils/analytics'

import { renderWithProviders } from '../../test-utils'

vi.mock('@src/pages/map/components/MapCanvas/MapCanvas', () => {
  return {
    MapCanvas: ({
      corners,
      publications,
      layers,
      onSelectPin,
    }: {
      corners: MapCornerPin[]
      publications: MapPublicationPin[]
      layers: { corners: boolean; publications: boolean }
      onSelectPin: (pin: MapPin) => void
    }) => {
      const visibleCorners = layers.corners ? corners : []
      const visiblePublications = layers.publications ? publications : []

      return (
        <div data-testid="mock-map" role="presentation">
          {visibleCorners.map((corner) => (
            <button
              key={`corner-${corner.id}`}
              type="button"
              aria-label={corner.name}
              onClick={() => onSelectPin({ type: 'corner', data: corner })}
            >
              Corner
            </button>
          ))}
          {visiblePublications.map((publication) => (
            <button
              key={`publication-${publication.id}`}
              type="button"
              aria-label={publication.title}
              onClick={() =>
                onSelectPin({ type: 'publication', data: publication })
              }
            >
              Publication
            </button>
          ))}
        </div>
      )
    },
  }
})

const getPinButtons = () => {
  const map = screen.getByTestId('mock-map')
  return within(map).queryAllByRole('button') as HTMLButtonElement[]
}

describe('MapPage', () => {
  test('renders search header, filters and map canvas', async () => {
    renderWithProviders(<MapPage />)

    expect(
      await screen.findByPlaceholderText('map.search.placeholder')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('map.filters.ariaLabel')).toBeInTheDocument()
    expect(screen.getByTestId('map-detail-placeholder')).toBeInTheDocument()

    await waitFor(() => {
      expect(getPinButtons().length).toBeGreaterThan(0)
    })
  })

  test('toggling layers updates the number of visible pins', async () => {
    renderWithProviders(<MapPage />)

    await waitFor(() => {
      expect(getPinButtons().length).toBeGreaterThan(0)
    })

    const cornersChip = screen.getByRole('button', {
      name: 'map.filters.types.corners',
    })
    const publicationsChip = screen.getByRole('button', {
      name: 'map.filters.types.publications',
    })

    fireEvent.click(cornersChip)
    fireEvent.click(publicationsChip)

    await waitFor(() => {
      expect(getPinButtons().length).toBe(0)
    })

    fireEvent.click(cornersChip)

    await waitFor(() => {
      expect(getPinButtons().length).toBeGreaterThan(0)
    })
  })

  test('handles geolocation denial, pin selection and fallback search', async () => {
    const trackSpy = vi.spyOn(analytics, 'track').mockImplementation(() => {})
    const geolocationDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'geolocation'
    )
    const geolocationMock = {
      getCurrentPosition: vi.fn((_success, error) => {
        error?.(new Error('Permission denied'))
      }),
    }

    Object.defineProperty(navigator, 'geolocation', {
      value: geolocationMock,
      configurable: true,
    })

    try {
      renderWithProviders(<MapPage />)

      await waitFor(() => {
        expect(getPinButtons().length).toBeGreaterThan(0)
      })

      const [targetPin] = getPinButtons()
      fireEvent.click(targetPin)

      fireEvent.click(screen.getByLabelText('map.filters.locateMe'))

      await waitFor(() => {
        expect(geolocationMock.getCurrentPosition).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(
          screen.getByText('map.status.locationDenied')
        ).toBeInTheDocument()
      })

      const fallbackInput = screen.getByPlaceholderText(
        'map.search.zoneFallback'
      )
      fireEvent.change(fallbackInput, { target: { value: 'Palermo' } })

      expect(
        await screen.findByPlaceholderText('map.search.placeholder')
      ).toHaveValue('Palermo')

      fireEvent.click(
        screen.getByRole('button', { name: /map\.cta\.createCorner/ })
      )

      expect(trackSpy).toHaveBeenCalledWith(
        'pin.opened',
        expect.objectContaining({ type: expect.any(String) })
      )
      expect(trackSpy).toHaveBeenCalledWith('cta.create_corner_clicked')
    } finally {
      if (geolocationDescriptor) {
        Object.defineProperty(navigator, 'geolocation', geolocationDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'geolocation')
      }
      trackSpy.mockRestore()
    }
  })

  test('supports advanced filters and layout toggles', async () => {
    const trackSpy = vi.spyOn(analytics, 'track').mockImplementation(() => {})

    try {
      renderWithProviders(<MapPage />)

      await waitFor(() => {
        expect(getPinButtons().length).toBeGreaterThan(0)
      })

      const railToggle = screen.getByRole('button', {
        name: 'map.filters.hide',
      })
      expect(railToggle).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(railToggle)
      expect(railToggle).toHaveTextContent('map.filters.show')
      expect(railToggle).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(railToggle)
      expect(railToggle).toHaveTextContent('map.filters.hide')
      expect(railToggle).toHaveAttribute('aria-pressed', 'true')

      fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })
      await waitFor(() => {
        expect(trackSpy).toHaveBeenCalledWith(
          'map.filter_changed',
          expect.objectContaining({ filter: 'distance', value: 8 })
        )
      })

      fireEvent.click(screen.getByRole('button', { name: 'Club lector' }))
      expect(trackSpy).toHaveBeenCalledWith(
        'map.filter_changed',
        expect.objectContaining({ filter: 'themes' })
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'map.filters.openNow' })
      )
      expect(trackSpy).toHaveBeenCalledWith(
        'map.filter_changed',
        expect.objectContaining({ filter: 'openNow' })
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'map.filters.recentActivity' })
      )
      expect(trackSpy).toHaveBeenCalledWith(
        'map.filter_changed',
        expect.objectContaining({ filter: 'recentActivity' })
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'map.filters.activity' })
      )
      expect(trackSpy).toHaveBeenCalledWith(
        'map.filter_changed',
        expect.objectContaining({ filter: 'layer', layer: 'activity' })
      )
    } finally {
      trackSpy.mockRestore()
    }
  })

  test('only shows the empty state when all visible datasets are empty', async () => {
    renderWithProviders(<MapPage />)

    await waitFor(() => {
      expect(getPinButtons().length).toBeGreaterThan(0)
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.publications' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.activity' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.recentActivity' })
    )

    await waitFor(() => {
      expect(screen.getByText('map.empty.title')).toBeInTheDocument()
    })
  })
})
