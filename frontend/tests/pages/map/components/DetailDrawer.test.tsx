import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type {
  MapActivityPoint,
  MapCornerPin,
  MapPin,
  MapPublicationPin,
} from '@src/api/map/map.types'
import { DetailDrawer } from '@src/pages/map/components/DetailDrawer/DetailDrawer'

import { renderWithProviders } from '../../../test-utils'

const corner: MapCornerPin = {
  id: 'corner-1',
  name: 'Rincón Centro',
  barrio: 'Centro',
  city: 'Ciudad',
  lat: -34.6,
  lon: -58.4,
  lastSignalAt: new Date().toISOString(),
  photos: ['https://example.com/photo.jpg'],
  rules: 'Traer mate',
  referencePointLabel: 'Frente a la plaza',
  themes: ['Ficción'],
}

const publications: MapPublicationPin[] = [
  {
    id: 'pub-1',
    cornerId: 'corner-1',
    title: 'Cien años de soledad',
    authors: ['García Márquez'],
    type: 'donation',
    distanceKm: 0.5,
  },
]

const activity: MapActivityPoint[] = [
  { id: 'a1', lat: -34.6, lon: -58.4, intensity: 3 },
  { id: 'a2', lat: -34.61, lon: -58.41, intensity: 5 },
]

describe('DetailDrawer', () => {
  test('renders tabs and triggers actions', () => {
    const handleTabChange = vi.fn()
    const handleClose = vi.fn()
    const handleProposeMeeting = vi.fn()
    const handleStartChat = vi.fn()
    const handleOpenReference = vi.fn()

    const selectedPin: MapPin = { type: 'corner', data: corner }

    const { rerender } = renderWithProviders(
      <DetailDrawer
        isOpen
        selectedPin={selectedPin}
        corner={corner}
        publications={publications}
        activity={activity}
        activeTab="corner"
        onTabChange={handleTabChange}
        onClose={handleClose}
        onProposeMeeting={handleProposeMeeting}
        onStartChat={handleStartChat}
        onOpenReference={handleOpenReference}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'map.cta.proposeMeeting' })
    )
    expect(handleProposeMeeting).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'map.cta.sendMessage' }))
    expect(handleStartChat).toHaveBeenCalledWith(undefined)

    fireEvent.click(
      screen.getByRole('button', { name: 'map.cta.openReference' })
    )
    expect(handleOpenReference).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('map.drawer.close'))
    expect(handleClose).toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('tab', { name: 'map.drawer.tabs.publications' })
    )
    expect(handleTabChange).toHaveBeenCalledWith('publications')

    rerender(
      <DetailDrawer
        isOpen
        selectedPin={selectedPin}
        corner={corner}
        publications={publications}
        activity={activity}
        activeTab="publications"
        onTabChange={handleTabChange}
        onClose={handleClose}
        onProposeMeeting={handleProposeMeeting}
        onStartChat={handleStartChat}
        onOpenReference={handleOpenReference}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'map.cta.sendMessage' }))
    expect(handleStartChat).toHaveBeenCalledWith({ publicationId: 'pub-1' })

    rerender(
      <DetailDrawer
        isOpen
        selectedPin={selectedPin}
        corner={corner}
        publications={publications}
        activity={activity}
        activeTab="activity"
        onTabChange={handleTabChange}
        onClose={handleClose}
        onProposeMeeting={handleProposeMeeting}
        onStartChat={handleStartChat}
        onOpenReference={handleOpenReference}
      />
    )

    expect(screen.getByText('map.activity.legend')).toBeInTheDocument()

    rerender(
      <DetailDrawer
        isOpen
        selectedPin={null}
        corner={null}
        publications={[]}
        activity={[]}
        activeTab="corner"
        onTabChange={handleTabChange}
        onClose={handleClose}
        onProposeMeeting={handleProposeMeeting}
        onStartChat={handleStartChat}
        onOpenReference={handleOpenReference}
      />
    )

    expect(screen.getByText('map.drawer.empty')).toBeInTheDocument()
  })
})
