import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { BookFeedCard } from '@src/components/feed/cards/BookFeedCard'
import { EventCard } from '@src/components/feed/cards/EventCard'
import { ForSaleCard } from '@src/components/feed/cards/ForSaleCard'
import { HouseCard } from '@src/components/feed/cards/HouseCard'
import { PeopleCard } from '@src/components/feed/cards/PeopleCard'
import { ReviewCard } from '@src/components/feed/cards/ReviewCard'
import { SeekingCard } from '@src/components/feed/cards/SeekingCard'
import { SwapProposalCard } from '@src/components/feed/cards/SwapProposalCard'
import type {
  BookItem,
  EventItem,
  HouseItem,
  PersonItem,
  ReviewItem,
  SaleItem,
  SeekingItem,
  SwapProposalItem,
} from '@src/components/feed/FeedItem.types'

import { renderWithProviders } from '../../../test-utils'

const book: BookItem = {
  type: 'book',
  id: 'b',
  title: 'Dune',
  author: 'Frank Herbert',
  cover: 'https://picsum.photos/seed/dune/600/300',
}

const swap: SwapProposalItem = {
  type: 'swap',
  id: 's',
  requester: 'Ana',
  offered: '1984',
  requested: 'The Hobbit',
}

const sale: SaleItem = {
  type: 'sale',
  id: 'sa',
  title: 'Foundation',
  price: 10,
  condition: 'used',
}

const seeking: SeekingItem = {
  type: 'seeking',
  id: 'se',
  user: 'Luis',
  title: 'Sapiens',
}

const review: ReviewItem = {
  type: 'review',
  id: 'r',
  user: 'Maria',
  book: 'Dune',
  quote: 'Great book',
}

const event: EventItem = {
  type: 'event',
  id: 'e',
  title: 'Book Fair',
  date: '2025-01-01',
  location: 'Casita Centro',
}

const house: HouseItem = {
  type: 'house',
  id: 'h',
  name: 'Casita Norte',
  distance: 1.2,
}

const person: PersonItem = {
  type: 'person',
  id: 'p',
  name: 'Carlos',
  match: 80,
  lastActivity: 'yesterday',
}

const cases = [
  ['book', <BookFeedCard item={book} />],
  ['swap', <SwapProposalCard item={swap} />],
  ['sale', <ForSaleCard item={sale} />],
  ['seeking', <SeekingCard item={seeking} />],
  ['review', <ReviewCard item={review} />],
  ['event', <EventCard item={event} />],
  ['house', <HouseCard item={house} />],
  ['person', <PeopleCard item={person} />],
] as const

describe('Feed cards accessibility', () => {
  test.each(cases)('%s card has accessible button', (_name, element) => {
    renderWithProviders(element)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAccessibleName()
  })
})
