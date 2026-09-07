import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type { CommunityCornerDetail } from '@src/api/community/corners.types'
import type { MapPin } from '@src/api/map/map.types'
import { MapSelectionCard } from '@components/map/MapSelectionCard/MapSelectionCard'

import { renderWithProviders } from '../../../test-utils'

const cornerPin: MapPin = {
  type: 'corner',
  data: {
    id: 'corner-1',
    name: 'Rincón de Palermo',
    barrio: 'Palermo',
    city: 'Buenos Aires',
    lat: -34.6,
    lon: -58.4,
    distanceKm: 1.2,
    lastSignalAt: '2025-01-15T12:00:00.000Z',
    photos: ['/corner.jpg'],
    themes: ['Comunidad'],
    status: 'active',
    isOpenNow: true,
  },
}

const cornerDetail: CommunityCornerDetail = {
  id: 'corner-1',
  name: 'Rincón de Palermo',
  scope: 'public',
  hostAlias: 'Lectura colectiva',
  rules: 'Dejá un libro por cada libro que retires.',
  schedule: null,
  status: 'active',
  visibilityPreference: 'approximate',
  imageUrl: '/corner.jpg',
  isOwner: false,
  location: {
    city: 'Buenos Aires',
    neighborhood: 'Palermo',
    referencePointLabel: 'Cerca de Plaza Italia',
    latitude: -34.6,
    longitude: -58.4,
    approximate: true,
  },
  activity: {
    totalExchanges: 12,
    weeklyExchanges: 3,
    lastActivityAt: '2025-01-15T12:00:00.000Z',
  },
}

const commonProps = {
  cornerDetail,
  isLoading: false,
  isError: false,
  isUpdating: false,
  onClose: vi.fn(),
  onOpenDetails: vi.fn(),
  onOpenPublication: vi.fn(),
}

describe('MapSelectionCard', () => {
  test('shows one rich corner selection and delegates opening details', () => {
    const onOpenDetails = vi.fn()
    renderWithProviders(
      <MapSelectionCard
        {...commonProps}
        pin={cornerPin}
        cornerDetailsOpen={false}
        onOpenDetails={onOpenDetails}
      />
    )

    const card = screen.getByRole('article', { name: 'Rincón de Palermo' })
    expect(card.querySelector('img')).toHaveAttribute('src', '/corner.jpg')
    expect(
      within(card).getByRole('button', { name: 'map.cta.openCorner' })
    ).toBeVisible()

    fireEvent.click(
      within(card).getByRole('button', { name: 'map.cta.openCorner' })
    )
    expect(onOpenDetails).toHaveBeenCalledOnce()
  })

  test('embeds detail data without duplicating the selected title', () => {
    renderWithProviders(
      <MapSelectionCard {...commonProps} pin={cornerPin} cornerDetailsOpen />
    )

    const card = screen.getByRole('article', { name: 'Rincón de Palermo' })
    expect(
      screen.getAllByRole('heading', { name: 'Rincón de Palermo' })
    ).toHaveLength(1)
    expect(screen.getByLabelText('map.cornerDetail.title')).toBeVisible()
    expect(card).toHaveTextContent('Cerca de Plaza Italia')
  })

  test('opens a selected publication through its own action', () => {
    const onOpenPublication = vi.fn()
    const publicationPin: MapPin = {
      type: 'publication',
      data: {
        id: 'listing-42',
        cornerId: 'corner-1',
        title: 'Rayuela',
        authors: [],
        type: 'offer',
        distanceKm: null,
      },
    }

    renderWithProviders(
      <MapSelectionCard
        {...commonProps}
        pin={publicationPin}
        cornerDetail={null}
        cornerDetailsOpen={false}
        onOpenPublication={onOpenPublication}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'map.cta.openPublication' })
    )
    expect(onOpenPublication).toHaveBeenCalledOnce()
    expect(
      screen.queryByLabelText('map.cornerDetail.title')
    ).not.toBeInTheDocument()
  })

  test('renders nothing when no pin is selected', () => {
    renderWithProviders(
      <MapSelectionCard {...commonProps} pin={null} cornerDetailsOpen={false} />
    )

    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
})
