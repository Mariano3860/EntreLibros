import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { MapHeader } from '@components/map/MapHeader/MapHeader'

import { renderWithProviders } from '../../../test-utils'

describe('MapHeader', () => {
  test('exposes search, chip and fallback interactions', () => {
    const handleSearchChange = vi.fn()
    const handleToggleLayer = vi.fn()
    const handleToggleOpenNow = vi.fn()
    const handleToggleRecentActivity = vi.fn()
    const handleToggleRail = vi.fn()
    const handleLocateMe = vi.fn()
    const handleZoneFallbackChange = vi.fn()

    renderWithProviders(
      <MapHeader
        searchValue=""
        onSearchChange={handleSearchChange}
        layers={{ corners: true, publications: false, activity: true }}
        onToggleLayer={handleToggleLayer}
        openNow
        onToggleOpenNow={handleToggleOpenNow}
        recentActivity={false}
        onToggleRecentActivity={handleToggleRecentActivity}
        onToggleRail={handleToggleRail}
        railOpen
        isFetching
        onLocateMe={handleLocateMe}
        geolocationDenied
        zoneFallback=""
        onZoneFallbackChange={handleZoneFallbackChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'map.filters.hide' }))
    expect(handleToggleRail).toHaveBeenCalled()

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Centro' },
    })
    expect(handleSearchChange).toHaveBeenCalledWith('Centro')

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.corners' })
    )
    expect(handleToggleLayer).toHaveBeenCalledWith('corners')

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.types.publications' })
    )
    expect(handleToggleLayer).toHaveBeenCalledWith('publications')

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.activity' })
    )
    expect(handleToggleLayer).toHaveBeenCalledWith('activity')

    fireEvent.click(screen.getByRole('button', { name: 'map.filters.openNow' }))
    expect(handleToggleOpenNow).toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'map.filters.recentActivity' })
    )
    expect(handleToggleRecentActivity).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('map.filters.locateMe'))
    expect(handleLocateMe).toHaveBeenCalled()

    const fallbackInput = screen.getByPlaceholderText('map.search.zoneFallback')
    fireEvent.change(fallbackInput, { target: { value: 'Palermo' } })
    expect(handleZoneFallbackChange).toHaveBeenCalledWith('Palermo')

    expect(screen.getByText('map.status.updating')).toBeInTheDocument()
  })
})
