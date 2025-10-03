import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { MapPage } from '@src/pages/map/MapPage'
import * as analytics from '@src/utils/analytics'

import { renderWithProviders } from '../../test-utils'

const getCanvas = () => screen.getByRole('presentation') as HTMLElement

const getPinButtons = () => {
  const canvas = getCanvas()
  return Array.from(
    canvas.querySelectorAll('button[aria-label]')
  ) as HTMLButtonElement[]
}

describe('MapPage', () => {
  test('renders search header, filters and map canvas', async () => {
    renderWithProviders(<MapPage />)

    expect(
      await screen.findByPlaceholderText('map.search.placeholder')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('map.filters.ariaLabel')).toBeInTheDocument()

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

  test('opens the detail drawer with privacy note when selecting a pin', async () => {
    renderWithProviders(<MapPage />)

    let targetPin: HTMLButtonElement | undefined

    await waitFor(() => {
      const pins = getPinButtons()
      expect(pins.length).toBeGreaterThan(0)
      targetPin = pins.find(
        (pin) => pin.getAttribute('aria-label') !== 'map.cluster.more'
      )
      if (!targetPin) {
        targetPin = pins[0]
      }
    })

    if (targetPin?.getAttribute('aria-label') === 'map.cluster.more') {
      fireEvent.click(targetPin)
      await waitFor(() => {
        const expandedPins = getPinButtons().filter(
          (pin) => pin.getAttribute('aria-label') !== 'map.cluster.more'
        )
        expect(expandedPins.length).toBeGreaterThan(0)
        targetPin = expandedPins[0]
      })
    }

    fireEvent.click(targetPin!)

    expect(
      await screen.findByText('map.detail.corner.noInventoryNote')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'map.cta.proposeMeeting' })
    ).toBeInTheDocument()
  })

  test('handles geolocation denial and map CTAs', async () => {
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

      let targetPin: HTMLButtonElement | undefined

      await waitFor(() => {
        const pins = getPinButtons()
        expect(pins.length).toBeGreaterThan(0)
        targetPin = pins.find(
          (pin) => pin.getAttribute('aria-label') !== 'map.cluster.more'
        )
        if (!targetPin) {
          targetPin = pins[0]
        }
      })

      if (targetPin?.getAttribute('aria-label') === 'map.cluster.more') {
        fireEvent.click(targetPin)
        await waitFor(() => {
          const expandedPins = getPinButtons().filter(
            (pin) => pin.getAttribute('aria-label') !== 'map.cluster.more'
          )
          expect(expandedPins.length).toBeGreaterThan(0)
          targetPin = expandedPins[0]
        })
      }

      fireEvent.click(targetPin!)

      fireEvent.click(
        await screen.findByRole('button', { name: 'map.cta.proposeMeeting' })
      )

      fireEvent.change(await screen.findByLabelText('map.modal.dateLabel'), {
        target: { value: '2025-03-10' },
      })
      fireEvent.change(screen.getByLabelText('map.modal.timeLabel'), {
        target: { value: '18:00' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'map.modal.confirm' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      fireEvent.click(
        screen.getByRole('button', { name: 'map.cta.sendMessage' })
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'map.cta.openReference' })
      )

      fireEvent.click(
        screen.getByRole('tab', { name: 'map.drawer.tabs.publications' })
      )
      const publicationMessages = await screen.findAllByRole('button', {
        name: 'map.cta.sendMessage',
      })
      fireEvent.click(publicationMessages[publicationMessages.length - 1])

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
        'agreement.proposed_from_map',
        expect.any(Object)
      )
      expect(trackSpy).toHaveBeenCalledWith(
        'agreement.proposed_from_map_submitted',
        expect.any(Object)
      )
      expect(trackSpy).toHaveBeenCalledWith(
        'chat.started_from_map',
        expect.any(Object)
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
})
