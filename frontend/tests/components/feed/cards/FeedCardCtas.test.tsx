import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/analytics', () => ({ track: vi.fn() }))

import i18n from '@src/assets/i18n/i18n'
import { BookFeedCard } from '@src/components/feed/cards/BookFeedCard'
import { EventCard } from '@src/components/feed/cards/EventCard'
import { ForSaleCard } from '@src/components/feed/cards/ForSaleCard'
import { HouseCard } from '@src/components/feed/cards/HouseCard'
import { PeopleCard } from '@src/components/feed/cards/PeopleCard'
import { ReviewCard } from '@src/components/feed/cards/ReviewCard'
import { SeekingCard } from '@src/components/feed/cards/SeekingCard'
import { SwapProposalCard } from '@src/components/feed/cards/SwapProposalCard'
import { track } from '@src/utils/analytics'

import { renderWithProviders } from '../../../test-utils'

describe('Feed card CTAs', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('en')
  })

  const feedMock = [
    {
      type: 'book',
      id: 'b1',
      user: 'Ana',
      avatar: '',
      time: '1h',
      likes: 0,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: '',
    },
    {
      type: 'swap',
      id: 's1',
      user: 'Luis',
      avatar: '',
      time: '2h',
      likes: 0,
      requester: {
        id: 'user-ana',
        displayName: 'Ana',
        username: '@ana',
        avatar: '',
      },
      offered: {
        id: 'listing-1984',
        title: '1984',
        author: 'George Orwell',
        category: 'book',
        owner: {
          id: 'user-ana',
          displayName: 'Ana',
          username: '@ana',
          avatar: '',
        },
      },
      requested: {
        id: 'listing-hobbit',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        category: 'book',
        owner: {
          id: 'user-luis',
          displayName: 'Luis',
          username: '@luis',
          avatar: '',
        },
      },
    },
    {
      type: 'sale',
      id: 'sa1',
      user: 'Maria',
      avatar: '',
      time: '3h',
      likes: 0,
      title: 'Foundation',
      price: 10,
      condition: 'used',
      cover: '',
    },
    {
      type: 'seeking',
      id: 'se1',
      user: 'Luis',
      avatar: '',
      time: '4h',
      likes: 0,
      title: 'Sapiens',
    },
    {
      type: 'review',
      id: 'r1',
      user: 'Maria',
      avatar: '',
      time: '5h',
      likes: 0,
      book: 'Dune',
      quote: 'Great book!',
      rating: 5,
    },
    {
      type: 'event',
      id: 'e1',
      user: 'Carlos',
      avatar: '',
      time: '6h',
      likes: 0,
      title: 'Book Fair',
      date: '2025-01-01',
      location: 'Casita Centro',
    },
    {
      type: 'house',
      id: 'h1',
      user: 'Sofia',
      avatar: '',
      time: '7h',
      likes: 0,
      name: 'Casita Norte',
      distance: 0.8,
    },
    {
      type: 'person',
      id: 'p1',
      user: 'Admin',
      avatar: '',
      time: '8h',
      likes: 0,
      name: 'Carlos',
      match: 85,
      lastActivity: 'yesterday',
    },
  ]

  const [book, swap, sale, seeking, review, event, house, person] = feedMock

  const cases = [
    {
      Component: BookFeedCard,
      item: book,
      label: 'community.feed.cta.propose_swap',
      expected: { type: 'book', action: 'primary' },
    },
    {
      Component: SwapProposalCard,
      item: swap,
      label: 'community.feed.cta.accept',
      expected: { type: 'swap', action: 'accept' },
    },
    {
      Component: ForSaleCard,
      item: sale,
      label: 'community.feed.cta.buy',
      expected: { type: 'sale', action: 'buy' },
    },
    {
      Component: SeekingCard,
      item: seeking,
      label: 'community.feed.cta.offer_copy',
      expected: { type: 'seeking', action: 'offer' },
    },
    {
      Component: ReviewCard,
      item: review,
      label: 'community.feed.cta.helpful',
      expected: { type: 'review', action: 'helpful' },
    },
    {
      Component: EventCard,
      item: event,
      label: 'community.feed.cta.go',
      expected: { type: 'event', action: 'go' },
    },
    {
      Component: HouseCard,
      item: house,
      label: 'community.feed.cta.open_map',
      expected: { type: 'house', action: 'map' },
    },
    {
      Component: PeopleCard,
      item: person,
      label: 'community.feed.cta.message',
      expected: { type: 'person', action: 'message' },
    },
  ] as const

  test.each(cases)(
    '%s triggers analytics',
    ({ Component, item, label, expected }) => {
      renderWithProviders(<Component item={item as never} />)
      fireEvent.click(screen.getByLabelText(label))
      expect(track).toHaveBeenCalledWith('feed.cta', expected)
    }
  )
})
