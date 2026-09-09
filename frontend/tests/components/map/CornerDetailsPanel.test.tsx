import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type { CommunityCornerDetail } from '@src/api/community/corners.types'
import { CornerDetailsPanel } from '@src/components/map/CornerDetailsPanel/CornerDetailsPanel'

import { renderWithProviders } from '../../test-utils'

const corner: CommunityCornerDetail = {
  id: 'corner-1',
  name: 'Rincón Centro',
  scope: 'public',
  hostAlias: 'Anfitrión',
  rules: 'Cuidar los libros',
  schedule: 'Sábados',
  status: 'active',
  visibilityPreference: 'approximate',
  imageUrl: 'https://example.com/corner.jpg',
  isOwner: true,
  location: {
    city: 'Buenos Aires',
    neighborhood: 'Centro',
    referencePointLabel: 'Cerca de la plaza',
    latitude: -34.6,
    longitude: -58.4,
    approximate: true,
  },
  activity: {
    totalExchanges: 4,
    weeklyExchanges: 2,
    lastActivityAt: null,
  },
}

describe('CornerDetailsPanel', () => {
  test('exposes edit and pause controls to the owner', () => {
    const onEdit = vi.fn()
    const onToggleStatus = vi.fn()

    renderWithProviders(
      <CornerDetailsPanel
        detail={corner}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />
    )

    fireEvent.click(screen.getByTestId('corner-edit-button'))
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'map.cornerDetail.pause' })
    )

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onToggleStatus).toHaveBeenCalledOnce()
  })

  test('hides owner controls from other viewers', () => {
    renderWithProviders(
      <CornerDetailsPanel detail={{ ...corner, isOwner: false }} />
    )

    expect(screen.queryByTestId('corner-edit-button')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'map.cornerDetail.pause' })
    ).not.toBeInTheDocument()
  })
})
