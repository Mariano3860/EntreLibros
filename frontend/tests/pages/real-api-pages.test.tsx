import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/runtimeEnv', () => ({ isApiMockMode: () => false }))
vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockResolvedValue({ id: 7, name: 'Mariano' }),
}))
vi.mock('@src/api/community/communityFeed.service', () => ({
  fetchCommunityFeed: vi
    .fn()
    .mockResolvedValue([
      { id: 'feed-1', user: 'Ana', time: 'Ahora', title: 'Dune' },
    ]),
}))
vi.mock('@src/api/community/activity.service', () => ({
  fetchActivityItems: vi.fn().mockResolvedValue([]),
}))
vi.mock('@src/api/community/corners.service', () => ({
  fetchNearbyCorners: vi.fn().mockResolvedValue([]),
}))
vi.mock('@src/api/community/suggestions.service', () => ({
  fetchSuggestions: vi.fn().mockResolvedValue([]),
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
vi.mock('@src/api/books/userBooks.service', () => ({
  fetchUserBooks: vi.fn().mockResolvedValue([]),
}))
vi.mock('@api/community/communityStories.service', () => ({
  createCommunityStory: vi.fn().mockResolvedValue({
    id: 'story-created',
    type: 'story',
    user: 'Mariano',
    avatar: '',
    time: 'Ahora',
    likes: 0,
    title: 'Una nueva historia',
    body: 'Una nueva historia',
  }),
}))
vi.mock('@src/hooks/api/useContactForm', () => ({
  useContactForm: () => ({
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
  }),
}))
import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'
import { ContactPage } from '@src/pages/contact/ContactPage'
import { StatsPage } from '@src/pages/stats/StatsPage'

import { renderWithProviders } from '../test-utils'

describe('prototype pages in real API mode', () => {
  test('renders persisted community and statistics data', async () => {
    const { unmount } = renderWithProviders(<CommunityFeedPage />)
    expect(await screen.findByText('Dune')).toBeVisible()
    unmount()

    renderWithProviders(<StatsPage />)
    expect(await screen.findByText('2')).toBeVisible()
    expect(screen.getByText('Intercambios')).toBeVisible()
  })

  test('keeps support connected to the real contact contract', async () => {
    renderWithProviders(<ContactPage />)
    expect(screen.getByRole('heading', { name: /ayudarte/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /Cuenta/ })).toBeVisible()
    expect(screen.getByText('Preguntas frecuentes')).toBeVisible()
    fireEvent.change(screen.getByLabelText('Tu consulta'), {
      target: { value: 'Necesito ayuda.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/ }))
  })

  test('opens the community publication modal in real API mode', async () => {
    renderWithProviders(<CommunityFeedPage />)
    const closeStoryModal = () =>
      fireEvent.click(
        screen.getAllByRole('button', { name: 'community.story.cancel' })[0]
      )
    fireEvent.click(screen.getByRole('button', { name: 'Red tea' }))
    expect(screen.getByRole('status')).toHaveTextContent('Red tea')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.click(screen.getByRole('button', { name: /Foto\/Video/ }))
    closeStoryModal()
    fireEvent.click(screen.getByRole('button', { name: /Ofrecer libro/ }))
    closeStoryModal()
    fireEvent.click(
      screen.getByRole('button', { name: /Proponer intercambio/ })
    )
    closeStoryModal()
    fireEvent.click(screen.getByRole('button', { name: /Encuesta/ }))
    closeStoryModal()

    const publishButtons = screen.getAllByRole('button', { name: /Publicar/ })
    fireEvent.click(publishButtons[0])
    expect(await screen.findByRole('dialog')).toBeVisible()
    fireEvent.change(screen.getByLabelText('community.story.bodyLabel'), {
      target: { value: 'Una historia conectada.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'community.story.publish' })
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })
})
