import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { CornersStrip } from '@src/components/community/corners/CornersStrip'
import styles from '@src/components/community/corners/CornersStrip.module.scss'

import { renderWithProviders } from '../../../test-utils'

const useNearbyCornersMock = vi.hoisted(() => vi.fn())

vi.mock('@src/hooks/api/useNearbyCorners', () => ({
  useNearbyCorners: useNearbyCornersMock,
}))

const mockCorners = [
  {
    id: 'corner-1',
    name: 'Rincón Centro',
    distanceKm: 1.25,
    imageUrl: 'https://example.com/corner-1.png',
    activityLabel: '32 actividades esta semana',
  },
  {
    id: 'corner-2',
    name: 'Rincón Norte',
    distanceKm: 0.4,
    imageUrl: 'https://example.com/corner-2.png',
    activityLabel: 'Sin número en la etiqueta',
  },
  {
    id: 'corner-3',
    name: 'Rincón Sur',
    distanceKm: 5.8,
    imageUrl: 'https://example.com/corner-3.png',
    activityLabel: null,
  },
]

describe('CornersStrip', () => {
  beforeEach(() => {
    useNearbyCornersMock.mockReset()
  })

  test('renders skeleton cards while loading data', () => {
    useNearbyCornersMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    const { container } = renderWithProviders(<CornersStrip />)

    const skeletons = container.querySelectorAll(`.${styles.skeleton}`)
    expect(skeletons).toHaveLength(4)
  })

  test('shows error message when the request fails', () => {
    useNearbyCornersMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<CornersStrip />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'community.feed.corners.error'
    )
  })

  test('shows empty state when there are no nearby corners', () => {
    useNearbyCornersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<CornersStrip />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'community.feed.corners.empty'
    )
  })

  test('renders the list of corners with badges and fallback image handling', () => {
    useNearbyCornersMock.mockReturnValue({
      data: mockCorners,
      isLoading: false,
      isError: false,
    })

    const { container } = renderWithProviders(<CornersStrip />)

    const region = screen.getByRole('region', {
      name: 'community.feed.corners.title',
    })
    expect(region).toBeInTheDocument()

    const viewMapLink = screen.getByRole('button', {
      name: 'community.feed.corners.viewMap',
    })
    expect(viewMapLink).toHaveAttribute('href', '/map')

    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(mockCorners.length)

    expect(within(cards[0]).getByText('Rincón Centro')).toBeInTheDocument()
    const badge = within(cards[0]).getByText('32')
    expect(badge).toHaveAttribute('aria-label', '32 actividades esta semana')

    const images = container.querySelectorAll('img')
    fireEvent.error(images[0])
    expect(images[0].src).toContain('corner-fallback')

    const activityBadges = container.querySelectorAll(`.${styles.activity}`)
    expect(activityBadges).toHaveLength(1)
  })
})
