import { fireEvent, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { StatsTab } from '@src/pages/community/tabs/StatsTab'

import { renderWithProviders } from '../../test-utils'

describe('StatsTab', () => {
  test('renders all sections', () => {
    const { getByText, getByLabelText } = renderWithProviders(<StatsTab />)
    expect(getByText('community.stats.title')).toBeInTheDocument()
    expect(getByText('community.stats.subtitle')).toBeInTheDocument()
    expect(getByText('community.stats.kpis.exchanges')).toBeInTheDocument()
    expect(getByText('community.stats.kpis.activeHouses')).toBeInTheDocument()
    expect(getByText('community.stats.kpis.activeUsers')).toBeInTheDocument()
    expect(getByText('community.stats.kpis.booksPublished')).toBeInTheDocument()
    expect(getByText('community.stats.trends.exchanges')).toBeInTheDocument()
    expect(getByText('community.stats.trends.newBooks')).toBeInTheDocument()
    expect(
      getByText('community.stats.topContributors.title')
    ).toBeInTheDocument()
    const list = getByLabelText('top-contributors')
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(getByText('community.stats.map.title')).toBeInTheDocument()
    expect(getByText('community.stats.hotSearches.title')).toBeInTheDocument()
  })

  test('changes active range', () => {
    const { getByText } = renderWithProviders(<StatsTab />)
    const button = getByText('community.stats.filters.30d')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
