import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { CornersMiniMap } from '@src/components/community/corners/CornersMiniMap'
import styles from '@src/components/community/corners/CornersMiniMap.module.scss'

import { renderWithProviders } from '../../../test-utils'

const useCornersMapMock = vi.hoisted(() => vi.fn())

vi.mock('@src/hooks/api/useCornersMap', () => ({
  useCornersMap: useCornersMapMock,
}))

describe('CornersMiniMap', () => {
  beforeEach(() => {
    useCornersMapMock.mockReset()
  })

  test('renders loader state while the map data is loading', () => {
    useCornersMapMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    const { container } = renderWithProviders(<CornersMiniMap />)

    const map = container.querySelector(`.${styles.map}`)
    expect(map).toBeInTheDocument()
    expect(map).toHaveClass(styles.loading)

    const loader = container.querySelector(`.${styles.loader}`)
    expect(loader).toBeInTheDocument()
  })

  test('shows an error message when the map request fails', () => {
    useCornersMapMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<CornersMiniMap />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('community.feed.cornersMap.error')
  })

  test('renders corner pins, description and footer when data is available', () => {
    useCornersMapMock.mockReturnValue({
      data: {
        description: 'Mapa de actividad de la comunidad',
        pins: [
          { id: 'pin-1', status: 'quiet', x: 12, y: 34 },
          { id: 'pin-2', status: 'active', x: 65, y: 22 },
        ],
      },
      isLoading: false,
      isError: false,
    })

    const { container } = renderWithProviders(<CornersMiniMap />)

    expect(
      screen.getByText('Mapa de actividad de la comunidad')
    ).toBeInTheDocument()
    expect(
      screen.getByText('community.feed.cornersMap.footer')
    ).toBeInTheDocument()

    const nearbyButton = screen.getByRole('button', {
      name: 'community.feed.cornersMap.actions.nearby',
    })
    expect(nearbyButton).toBeInTheDocument()

    const pins = Array.from(container.querySelectorAll(`.${styles.pin}`))
    expect(pins).toHaveLength(2)

    const quietPin = pins.find((pin) => pin.classList.contains(styles.pinQuiet))
    expect(quietPin).toHaveStyle({ left: '12%', top: '34%' })

    const activePin = pins.find(
      (pin) => !pin.classList.contains(styles.pinQuiet)
    )
    expect(activePin).toHaveStyle({ left: '65%', top: '22%' })
  })
})
