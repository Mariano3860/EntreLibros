import { describe, expect, test, vi } from 'vitest'

import { FeedList } from '@src/components/feed/FeedList'
import type { FeedItem } from '@src/components/feed/FeedItem.types'

import { renderWithProviders } from '../../test-utils'

const mocks = vi.hoisted(() => {
  return {
    bookCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-book-${item.id}`} />
    )),
    swapCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-swap-${item.id}`} />
    )),
    saleCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-sale-${item.id}`} />
    )),
    seekingCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-seeking-${item.id}`} />
    )),
    reviewCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-review-${item.id}`} />
    )),
    eventCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-event-${item.id}`} />
    )),
    houseCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-house-${item.id}`} />
    )),
    peopleCardMock: vi.fn(({ item }: { item: FeedItem }) => (
      <div data-testid={`card-person-${item.id}`} />
    )),
  }
})

vi.mock('@src/components/feed/cards/BookFeedCard', () => ({
  BookFeedCard: mocks.bookCardMock,
}))
vi.mock('@src/components/feed/cards/SwapProposalCard', () => ({
  SwapProposalCard: mocks.swapCardMock,
}))
vi.mock('@src/components/feed/cards/ForSaleCard', () => ({
  ForSaleCard: mocks.saleCardMock,
}))
vi.mock('@src/components/feed/cards/SeekingCard', () => ({
  SeekingCard: mocks.seekingCardMock,
}))
vi.mock('@src/components/feed/cards/ReviewCard', () => ({
  ReviewCard: mocks.reviewCardMock,
}))
vi.mock('@src/components/feed/cards/EventCard', () => ({
  EventCard: mocks.eventCardMock,
}))
vi.mock('@src/components/feed/cards/HouseCard', () => ({
  HouseCard: mocks.houseCardMock,
}))
vi.mock('@src/components/feed/cards/PeopleCard', () => ({
  PeopleCard: mocks.peopleCardMock,
}))

describe('FeedList', () => {
  test('renders the appropriate card for each feed item type', () => {
    const items: FeedItem[] = [
      { id: 'book-1', type: 'book' } as FeedItem,
      { id: 'swap-1', type: 'swap' } as FeedItem,
      { id: 'sale-1', type: 'sale' } as FeedItem,
      { id: 'seeking-1', type: 'seeking' } as FeedItem,
      { id: 'review-1', type: 'review' } as FeedItem,
      { id: 'event-1', type: 'event' } as FeedItem,
      { id: 'house-1', type: 'house' } as FeedItem,
      { id: 'person-1', type: 'person' } as FeedItem,
    ]

    const { queryByTestId } = renderWithProviders(<FeedList items={items} />)

    expect(queryByTestId('card-book-book-1')).toBeInTheDocument()
    expect(queryByTestId('card-swap-swap-1')).toBeInTheDocument()
    expect(queryByTestId('card-sale-sale-1')).toBeInTheDocument()
    expect(queryByTestId('card-seeking-seeking-1')).toBeInTheDocument()
    expect(queryByTestId('card-review-review-1')).toBeInTheDocument()
    expect(queryByTestId('card-event-event-1')).toBeInTheDocument()
    expect(queryByTestId('card-house-house-1')).toBeInTheDocument()
    expect(queryByTestId('card-person-person-1')).toBeInTheDocument()

    const firstCall = mocks.bookCardMock.mock.calls.at(0)?.[0]
    expect(firstCall?.item).toMatchObject({ id: 'book-1', type: 'book' })

    expect(mocks.swapCardMock).toHaveBeenCalled()
    expect(mocks.saleCardMock).toHaveBeenCalled()
    expect(mocks.seekingCardMock).toHaveBeenCalled()
    expect(mocks.reviewCardMock).toHaveBeenCalled()
    expect(mocks.eventCardMock).toHaveBeenCalled()
    expect(mocks.houseCardMock).toHaveBeenCalled()
    expect(mocks.peopleCardMock).toHaveBeenCalled()
  })
})
