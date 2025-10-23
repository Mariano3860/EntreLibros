import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type { MapCornerPin } from '@src/api/map/map.types'
import { ProposeMeetingModal } from '@src/pages/map/components/ProposeMeetingModal/ProposeMeetingModal'

import { renderWithProviders } from '../../../test-utils'

const corners: MapCornerPin[] = [
  {
    id: 'corner-1',
    name: 'Casita Norte',
    barrio: 'Norte',
    city: 'Ciudad',
    lat: -34.6,
    lon: -58.4,
    lastSignalAt: new Date().toISOString(),
    photos: [],
    themes: ['Infancias'],
    status: 'active',
  },
  {
    id: 'corner-2',
    name: 'Casita Sur',
    barrio: 'Sur',
    city: 'Ciudad',
    lat: -34.61,
    lon: -58.41,
    lastSignalAt: new Date().toISOString(),
    photos: [],
    themes: ['Poesía'],
    status: 'paused',
  },
]

describe('ProposeMeetingModal', () => {
  test('does not render when closed', () => {
    const { container } = renderWithProviders(
      <ProposeMeetingModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        availableCorners={corners}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('resets fields on open and submits selected data', () => {
    const handleClose = vi.fn()
    const handleSubmit = vi.fn()

    renderWithProviders(
      <ProposeMeetingModal
        isOpen
        onClose={handleClose}
        onSubmit={handleSubmit}
        availableCorners={corners}
        defaultCornerId="corner-2"
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('corner-2')

    fireEvent.change(select, { target: { value: 'corner-1' } })
    fireEvent.change(screen.getByLabelText('map.modal.dateLabel'), {
      target: { value: '2025-02-01' },
    })
    fireEvent.change(screen.getByLabelText('map.modal.timeLabel'), {
      target: { value: '10:30' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'map.modal.confirm' }))

    expect(handleSubmit).toHaveBeenCalledWith({
      cornerId: 'corner-1',
      date: '2025-02-01',
      time: '10:30',
    })
    expect(handleClose).toHaveBeenCalled()
  })
})
