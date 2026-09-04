import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type {
  MapCornerPin,
  MapQueryInput,
  MapResponse,
} from '@src/api/map/map.types'

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

const { fetchMe, fetchProfile, useMapDataMock } = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  fetchProfile: vi.fn(),
  useMapDataMock: vi.fn(),
}))

vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))
vi.mock('@src/api/user/profile.service', () => ({ fetchProfile }))
vi.mock('@src/hooks/api/useMapData', () => ({
  useMapData: (input: MapQueryInput) => {
    useMapDataMock(input)
    return {
      data: mapResponse,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    }
  },
}))
vi.mock('@components/map/MapCanvas/MapCanvas', () => ({
  MapCanvas: ({
    corners,
    userLocation,
    onSelectPin,
  }: {
    corners: MapCornerPin[]
    userLocation?: { latitude: number; longitude: number } | null
    onSelectPin: (pin: { type: 'corner'; data: MapCornerPin }) => void
  }) => (
    <div data-testid="map-canvas">
      {userLocation ? (
        <span data-testid="profile-location">
          {userLocation.latitude},{userLocation.longitude}
        </span>
      ) : null}
      {corners.map((corner) => (
        <button
          key={corner.id}
          type="button"
          onClick={() => onSelectPin({ type: 'corner', data: corner })}
        >
          {corner.name}
        </button>
      ))}
    </div>
  ),
}))

import { MapPage } from '@src/pages/map/MapPage'

import { renderWithProviders } from '../../test-utils'

const mapResponse: MapResponse = {
  corners: [
    {
      id: 'corner-1',
      name: 'Rincón cercano',
      barrio: 'Palermo',
      city: 'Buenos Aires',
      lat: -34.604,
      lon: -58.382,
      distanceKm: 0.3,
      lastSignalAt: null,
      photos: [],
      themes: ['Comunidad'],
      status: 'active',
    },
  ],
  publications: [],
  activity: [],
  meta: {
    bbox: { north: -34.5, south: -34.7, east: -58.3, west: -58.6 },
    generatedAt: '2025-01-15T12:00:00.000Z',
  },
}

const profile = {
  id: 7,
  name: 'Reader',
  alias: 'Reader',
  email: 'reader@example.com',
  language: 'es',
  profileDescription: null,
  profilePhoto: null,
  profileVisibility: 'public' as const,
  locationVisibility: 'city' as const,
  location: { latitude: -34.6037, longitude: -58.3816 },
  interests: [],
  country: 'Argentina' as const,
  city: 'Buenos Aires',
  neighborhood: null,
  street: null,
}

describe('MapPage in real API mode', () => {
  beforeEach(() => {
    fetchMe.mockReset()
    fetchProfile.mockReset()
    useMapDataMock.mockClear()
    fetchMe.mockResolvedValue({ id: profile.id, email: profile.email })
    fetchProfile.mockResolvedValue(profile)
  })

  test('uses the profile zone when device location is denied', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error()) },
    })

    try {
      renderWithProviders(<MapPage />)

      expect(
        await screen.findByText(/Ordenando lugares según tu zona de perfil/)
      ).toBeVisible()
      expect(screen.getByTestId('profile-location')).toHaveTextContent(
        '-34.6037,-58.3816'
      )
      await waitFor(() =>
        expect(useMapDataMock.mock.calls.at(-1)?.[0]).toEqual(
          expect.objectContaining({
            filters: expect.objectContaining({ distanceKm: null }),
          })
        )
      )
      expect(useMapDataMock.mock.calls.at(-1)?.[0]).toHaveProperty(
        'center',
        undefined
      )
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })

  test('sends the selected radius with the profile zone', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error()) },
    })

    try {
      renderWithProviders(<MapPage />)
      await screen.findByTestId('profile-location')
      fireEvent.change(
        screen.getByRole('slider', { name: 'Radio geográfico' }),
        {
          target: { value: '1' },
        }
      )

      await waitFor(() =>
        expect(useMapDataMock.mock.calls.at(-1)?.[0]).toEqual(
          expect.objectContaining({
            center: profile.location,
            filters: expect.objectContaining({ distanceKm: 5 }),
          })
        )
      )
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original)
      else Reflect.deleteProperty(navigator, 'geolocation')
    }
  })
})
