import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { FilterRail } from '@components/map/FilterRail/FilterRail'

import { renderWithProviders } from '../../../test-utils'

describe('FilterRail', () => {
  test('invokes callbacks when interacting with exploration controls', () => {
    const handleSearchChange = vi.fn()
    const handleDistanceChange = vi.fn()
    const handleToggleLayer = vi.fn()
    const handleCategoryChange = vi.fn()
    const handleToggleOpenNow = vi.fn()
    const handleToggleRecentActivity = vi.fn()

    renderWithProviders(
      <FilterRail
        searchValue=""
        onSearchChange={handleSearchChange}
        distanceKm={5}
        onDistanceChange={handleDistanceChange}
        categories={['Todo', 'Comunidad']}
        selectedCategory="Todo"
        onCategoryChange={handleCategoryChange}
        layers={{ corners: true, publications: true, activity: true }}
        onToggleLayer={handleToggleLayer}
        openNow={false}
        onToggleOpenNow={handleToggleOpenNow}
        recentActivity
        onToggleRecentActivity={handleToggleRecentActivity}
        activityItems={[]}
      />
    )

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Palermo' },
    })
    expect(handleSearchChange).toHaveBeenCalledWith('Palermo')

    const radius = screen.getByRole('slider', {
      name: /Radio geogr/,
    })
    fireEvent.change(radius, { target: { value: '2' } })
    expect(handleDistanceChange).toHaveBeenCalledWith(30)
    fireEvent.change(radius, { target: { value: '4' } })
    expect(handleDistanceChange).toHaveBeenCalledWith(null)

    fireEvent.click(
      screen.getByRole('button', { name: /map\.filters\.types\.corners/ })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /map\.filters\.types\.publications/,
      })
    )
    expect(handleToggleLayer).toHaveBeenCalledWith('corners')
    expect(handleToggleLayer).toHaveBeenCalledWith('publications')

    fireEvent.click(screen.getByRole('button', { name: 'Comunidad' }))
    expect(handleCategoryChange).toHaveBeenCalledWith('Comunidad')

    fireEvent.click(screen.getByLabelText('map.filters.openNow'))
    expect(handleToggleOpenNow).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('map.exploration.activityVisible'))
    expect(handleToggleRecentActivity).toHaveBeenCalled()
  })
})
