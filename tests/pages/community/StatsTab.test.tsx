import { fireEvent, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { StatsTab } from '@src/pages/community/tabs/StatsTab'

import { renderWithProviders } from '../../test-utils'

describe('StatsTab', () => {
  test('renders all sections', async () => {
    const { getByText, findByText, findByLabelText } = renderWithProviders(
      <StatsTab />
    )
    expect(getByText('community.stats.title')).toBeInTheDocument()
    expect(getByText('community.stats.subtitle')).toBeInTheDocument()
    await findByText('community.stats.kpis.exchanges')
    await findByText('community.stats.kpis.activeHouses')
    await findByText('community.stats.kpis.activeUsers')
    await findByText('community.stats.kpis.booksPublished')
    await findByText('community.stats.trends.exchanges')
    await findByText('community.stats.trends.newBooks')
    await findByText('community.stats.topContributors.title')
    const list = await findByLabelText('top-contributors')
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    await findByText('community.stats.map.title')
    await findByText('community.stats.hotSearches.title')
  })

  test('changes active range', async () => {
    const { findByText } = renderWithProviders(<StatsTab />)
    const button = await findByText('community.stats.filters.30d')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
