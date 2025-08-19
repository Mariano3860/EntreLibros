import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { CommunityPage } from '@src/pages/community/CommunityPage'

import { renderWithProviders } from '../../test-utils'
import { ForumsTab } from '@src/pages/community/tabs/ForumsTab'
import { MessagesTab } from '@src/pages/community/tabs/MessagesTab'
import { EventsTab } from '@src/pages/community/tabs/EventsTab'
import { StatsTab } from '@src/pages/community/tabs/StatsTab'

describe('CommunityPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<CommunityPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })

  test('renders community tabs', () => {
    const { getByRole, getAllByRole } = renderWithProviders(<CommunityPage />)
    expect(getByRole('tablist')).toBeInTheDocument()
    expect(getAllByRole('tab')).toHaveLength(5)
  })

  test('renders individual tab components', () => {
    const forums = renderWithProviders(<ForumsTab />)
    expect(forums.getByText('community.forums.placeholder')).toBeInTheDocument()
    const messages = renderWithProviders(<MessagesTab />)
    expect(messages.getByText('community.messages.placeholder')).toBeInTheDocument()
    const events = renderWithProviders(<EventsTab />)
    expect(events.getByText('community.events.placeholder')).toBeInTheDocument()
    const stats = renderWithProviders(<StatsTab />)
    expect(stats.getByText('community.stats.placeholder')).toBeInTheDocument()
  })
})
