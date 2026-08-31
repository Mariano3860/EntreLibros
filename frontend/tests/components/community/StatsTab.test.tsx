import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { StatsTab } from '@src/components/community/StatsTab'
import type { CommunityStats } from '@src/api/community/communityStats.types'
import { useCommunityStats } from '@src/hooks/api/useCommunityStats'

import { renderWithProviders } from '../../test-utils'

vi.mock('@src/hooks/api/useCommunityStats', () => ({
  useCommunityStats: vi.fn(),
}))

const stats: CommunityStats = {
  kpis: {
    exchanges: 134,
    activeHouses: 42,
    activeUsers: 287,
    booksPublished: 913,
  },
  trendExchanges: [10, 25, 40],
  trendNewBooks: [15, 30],
  topContributors: [
    { username: 'Ana Pérez', metric: 'exchanges', value: 18 },
    { username: 'Luis García', metric: 'books', value: 12 },
  ],
  hotSearches: [
    { term: 'Dune', count: 21 },
    { term: 'Historia', count: 9 },
  ],
  activeHousesMap: [
    { top: '25%', left: '40%' },
    { top: '60%', left: '70%' },
  ],
}

describe('StatsTab', () => {
  test('renders the filter shell without statistics data', () => {
    vi.mocked(useCommunityStats).mockReturnValue({ data: undefined } as never)

    renderWithProviders(<StatsTab />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.queryByText('134')).not.toBeInTheDocument()
  })

  test('renders KPI and detail cards and changes the selected range', () => {
    vi.mocked(useCommunityStats).mockReturnValue({ data: stats } as never)

    renderWithProviders(<StatsTab />)

    expect(screen.getByText('134')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('287')).toBeInTheDocument()
    expect(screen.getByText('913')).toBeInTheDocument()
    expect(screen.getByText('Dune (21)')).toBeInTheDocument()
    expect(screen.getByText('Historia (9)')).toBeInTheDocument()
    expect(screen.getByLabelText('top-contributors')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'Ana Pérez' })).toHaveLength(1)
    expect(screen.getAllByRole('img', { name: 'Luis García' })).toHaveLength(1)
    expect(screen.getAllByRole('button')).toHaveLength(3)

    const rangeButtons = screen.getAllByRole('button')
    expect(rangeButtons[0]).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(rangeButtons[1])
    expect(rangeButtons[0]).toHaveAttribute('aria-pressed', 'false')
    expect(rangeButtons[1]).toHaveAttribute('aria-pressed', 'true')
  })
})
