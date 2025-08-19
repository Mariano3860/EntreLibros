import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { AuthProvider } from '@src/contexts/auth/AuthContext'
import { ThemeProvider } from '@src/contexts/theme/ThemeContext'
import { CommunityPage } from '@src/pages/community/CommunityPage'
import { EventsTab } from '@src/pages/community/tabs/EventsTab'
import { ForumsTab } from '@src/pages/community/tabs/ForumsTab'
import { MessagesTab } from '@src/pages/community/tabs/MessagesTab'
import { StatsTab } from '@src/pages/community/tabs/StatsTab'

import { renderWithProviders } from '../../test-utils'

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
    expect(
      messages.getByText('community.messages.placeholder')
    ).toBeInTheDocument()
    const events = renderWithProviders(<EventsTab />)
    expect(events.getByText('community.events.placeholder')).toBeInTheDocument()
    const stats = renderWithProviders(<StatsTab />)
    expect(stats.getByText('community.stats.placeholder')).toBeInTheDocument()
  })

  test('tab links use absolute paths', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const { getByText } = render(
      <MemoryRouter initialEntries={['/community/forums']}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <Routes>
                <Route path="/community/*" element={<CommunityPage />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )

    const messagesTab = getByText(
      'community.tabs.messages'
    ) as HTMLAnchorElement
    expect(messagesTab.getAttribute('href')).toBe('/community/messages')
  })
})
