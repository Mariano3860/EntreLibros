import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))
vi.mock('@src/api/community/communityStats.service', () => ({
  fetchCommunityStats: vi.fn().mockResolvedValue({
    kpis: { exchanges: 2, activeHouses: 3, activeUsers: 4, booksPublished: 5 },
    trendExchanges: [1, 2],
    trendNewBooks: [1, 2],
    topContributors: [],
    hotSearches: [],
    activeHousesMap: [],
  }),
}))
vi.mock('@src/api/community/mvpMetrics.service', () => ({
  fetchMvpMetrics: vi.fn().mockResolvedValue({
    status: 'data',
    activeCorners: 3,
    activeListings: 5,
    confirmedAgreements: 2,
    discoveryTimeMinutes: null,
    funnel: { publications: 5, contacts: 2, agreements: 2, confirmations: 2 },
  }),
}))

import { StatsPage } from '@src/pages/stats/StatsPage'

import { renderWithProviders } from '../../test-utils'

describe('StatsPage', () => {
  test('renders persisted statistics and analytic regions', async () => {
    renderWithProviders(<StatsPage />)

    await screen.findByText('Intercambios')
    expect(screen.getByText('Intercambios')).toBeVisible()
    expect(
      screen.getByRole('img', { name: 'Intercambios por período' })
    ).toBeVisible()
    expect(screen.getByText('Contribuyentes destacados')).toBeVisible()
    expect(screen.getByText('Búsquedas populares')).toBeVisible()
  })

  test('changes the selected period used by the persisted metrics query', async () => {
    renderWithProviders(<StatsPage />)
    const select = await screen.findByRole('combobox')

    fireEvent.change(select, { target: { value: '90' } })
    expect(select).toHaveValue('90')
  })
})
