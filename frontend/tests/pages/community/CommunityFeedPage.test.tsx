import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { FeedItem } from '@src/components/feed/FeedItem.types'
import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'

import { renderWithProviders } from '../../test-utils'

const { feedListMock, communityFeedMock } = vi.hoisted(() => {
  return {
    feedListMock: vi.fn(({ items }: { items: FeedItem[] }) => (
      <div data-testid="feed-list">{items.length}</div>
    )),
    communityFeedMock: vi.fn(),
  }
})

vi.mock('@components/feed/FeedList', () => ({
  FeedList: feedListMock,
}))

vi.mock('@components/feed/ActivityBar', () => ({
  ActivityBar: () => <div data-testid="activity-bar" />,
}))

vi.mock('@components/community/corners/CornersStrip', () => ({
  CornersStrip: () => <div data-testid="corners-strip" />,
}))

vi.mock('@components/feed/RightPanel', () => ({
  RightPanel: () => <aside data-testid="right-panel" />,
}))

vi.mock('@components/logo/LogoEntreLibros', () => ({
  LogoEntreLibros: () => <span>EntreLibros</span>,
}))

vi.mock('@components/layout/BaseLayout/BaseLayout', () => ({
  BaseLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-layout">{children}</div>
  ),
}))

vi.mock('@src/hooks/api/useCommunityFeed', () => ({
  useCommunityFeed: communityFeedMock,
}))

const bookItem: FeedItem = {
  type: 'book',
  id: 'book-1',
  user: 'Ana',
  avatar: '',
  time: '1h',
  likes: 5,
  title: 'Dune',
  author: 'Frank Herbert',
  cover: '',
}

const houseItem: FeedItem = {
  type: 'house',
  id: 'house-1',
  user: 'Equipo',
  avatar: '',
  time: '2h',
  likes: 2,
  name: 'Casa Azul',
  distance: 1.2,
}

const swapItem: FeedItem = {
  type: 'swap',
  id: 'swap-1',
  user: 'Sofia',
  avatar: '',
  time: '3h',
  likes: 3,
  requester: 'Ana',
  offered: '1984',
  requested: 'The Hobbit',
}

const defaultFeedReturn = () => ({
  data: { pages: [[bookItem, houseItem, swapItem]] },
  fetchNextPage: vi.fn(),
  hasNextPage: false,
})

const originalIntersectionObserver = globalThis.IntersectionObserver

const getLastRenderedItems = () => {
  const lastCall = feedListMock.mock.calls.at(-1)
  return lastCall ? (lastCall[0] as { items: FeedItem[] }).items : []
}

describe('CommunityFeedPage', () => {
  beforeEach(() => {
    feedListMock.mockClear()
    communityFeedMock.mockReset()
    communityFeedMock.mockReturnValue(defaultFeedReturn())

    if (typeof globalThis.IntersectionObserver !== 'function') {
      const observerMock = vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))

      Object.defineProperty(globalThis, 'IntersectionObserver', {
        configurable: true,
        writable: true,
        value: observerMock,
      })
    }
  })

  afterEach(() => {
    if (originalIntersectionObserver === undefined) {
      delete (
        globalThis as { IntersectionObserver?: typeof IntersectionObserver }
      ).IntersectionObserver
    } else {
      Object.defineProperty(globalThis, 'IntersectionObserver', {
        configurable: true,
        writable: true,
        value: originalIntersectionObserver!,
      })
    }
  })

  test('renders feed header and filters', () => {
    const { getByText, getByLabelText } = renderWithProviders(
      <CommunityFeedPage />
    )
    expect(getByText('EntreLibros')).toBeInTheDocument()
    expect(getByLabelText('community.feed.search')).toBeInTheDocument()
    expect(getByText('community.feed.tabs.all')).toBeInTheDocument()
  })

  test('filters items based on search matches for title, name and user', async () => {
    renderWithProviders(<CommunityFeedPage />)

    const searchInput = screen.getByLabelText('community.feed.search')

    expect(getLastRenderedItems()).toHaveLength(3)

    fireEvent.change(searchInput, { target: { value: 'dune' } })
    await waitFor(() => {
      expect(getLastRenderedItems()).toEqual([
        expect.objectContaining({ id: 'book-1' }),
      ])
    })

    fireEvent.change(searchInput, { target: { value: 'casa' } })
    await waitFor(() => {
      expect(getLastRenderedItems()).toEqual([
        expect.objectContaining({ id: 'house-1' }),
      ])
    })

    fireEvent.change(searchInput, { target: { value: 'sofia' } })
    await waitFor(() => {
      expect(getLastRenderedItems()).toEqual([
        expect.objectContaining({ id: 'swap-1' }),
      ])
    })

    fireEvent.change(searchInput, { target: { value: 'no match' } })
    await waitFor(() => {
      expect(getLastRenderedItems()).toHaveLength(0)
    })
  })

  test('gracefully skips observer setup when IntersectionObserver is unavailable', () => {
    const fetchNextPage = vi.fn()
    communityFeedMock.mockReturnValue({
      data: { pages: [[bookItem]] },
      fetchNextPage,
      hasNextPage: true,
    })

    delete (
      globalThis as { IntersectionObserver?: typeof IntersectionObserver }
    ).IntersectionObserver

    expect(() => renderWithProviders(<CommunityFeedPage />)).not.toThrow()
    expect(feedListMock).toHaveBeenCalled()
  })
})
