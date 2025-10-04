import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { FilterRail } from '@src/pages/map/components/FilterRail/FilterRail'

import { renderWithProviders } from '../../../test-utils'

describe('FilterRail', () => {
  test('invokes callbacks when interacting with controls', () => {
    const handleDistanceChange = vi.fn()
    const handleToggleLayer = vi.fn()
    const handleToggleTheme = vi.fn()
    const handleToggleOpenNow = vi.fn()
    const handleToggleRecentActivity = vi.fn()

    renderWithProviders(
      <FilterRail
        distanceKm={5}
        onDistanceChange={handleDistanceChange}
        layers={{ corners: true, publications: true, activity: true }}
        onToggleLayer={handleToggleLayer}
        availableThemes={['Club lector', 'Poesía']}
        selectedThemes={['Poesía']}
        onToggleTheme={handleToggleTheme}
        openNow={false}
        onToggleOpenNow={handleToggleOpenNow}
        recentActivity
        onToggleRecentActivity={handleToggleRecentActivity}
      />
    )

    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })
    expect(handleDistanceChange).toHaveBeenCalledWith(8)

    const [cornersCheckbox, publicationsCheckbox, activityCheckbox] =
      screen.getAllByRole('checkbox')
    fireEvent.click(cornersCheckbox)
    fireEvent.click(publicationsCheckbox)
    fireEvent.click(activityCheckbox)
    expect(handleToggleLayer).toHaveBeenCalledWith('corners')
    expect(handleToggleLayer).toHaveBeenCalledWith('publications')
    expect(handleToggleLayer).toHaveBeenCalledWith('activity')

    fireEvent.click(screen.getByRole('button', { name: 'Club lector' }))
    expect(handleToggleTheme).toHaveBeenCalledWith('Club lector')

    fireEvent.click(screen.getByLabelText('map.filters.openNow'))
    expect(handleToggleOpenNow).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('map.filters.recentActivity'))
    expect(handleToggleRecentActivity).toHaveBeenCalled()
  })
})
