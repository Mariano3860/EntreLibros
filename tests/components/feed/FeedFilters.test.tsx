import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import i18n from '@src/assets/i18n/i18n'
import { FeedFilters } from '@src/components/feed/FeedFilters'

import { renderWithProviders } from '../../test-utils'

describe('FeedFilters', () => {
  test('calls onSearchChange when typing', async () => {
    await i18n.changeLanguage('en')
    const handleSearch = vi.fn()
    renderWithProviders(
      <FeedFilters filter="all" onFilterChange={() => {}} onSearchChange={handleSearch} />,
    )
    const input = screen.getByLabelText(/search/i)
    fireEvent.change(input, { target: { value: 'dune' } })
    expect(handleSearch).toHaveBeenCalledWith('dune')
  })

  test('calls onFilterChange when a tab is clicked', async () => {
    await i18n.changeLanguage('en')
    const handleFilter = vi.fn()
    renderWithProviders(
      <FeedFilters filter="all" onFilterChange={handleFilter} onSearchChange={() => {}} />,
    )
    fireEvent.click(screen.getByLabelText('community.feed.tabs.swap'))
    expect(handleFilter).toHaveBeenCalledWith('swap')
  })
})

