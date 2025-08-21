import { describe, expect, test } from 'vitest'

import i18n from '@src/assets/i18n/i18n'
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

const base = {
  user: 'User',
  avatar: 'https://i.pravatar.cc/100?img=1',
  time: 'now',
  likes: 0,
}

const book: BookItem = {
  ...base,
  type: 'book',
  id: 'b',
  title: 'Dune',
  author: 'Frank Herbert',
  cover: 'https://picsum.photos/seed/dune/600/400',
}

const swap: SwapProposalItem = {
  ...base,
  type: 'swap',
  id: 's',
  requester: 'Ana',
  offered: '1984',
  requested: 'The Hobbit',
}

const sale: SaleItem = {
  ...base,
  type: 'sale',
  id: 'sa',
  title: 'Foundation',
  price: 10,
  condition: 'used',
  cover: 'https://picsum.photos/seed/foundation/600/400',
}

const seeking: SeekingItem = {
  ...base,
  type: 'seeking',
  id: 'se',
  title: 'Sapiens',
}

const review: ReviewItem = {
  ...base,
  type: 'review',
  id: 'r',
  book: 'Dune',
  quote: 'Great book',
}

const event: EventItem = {
  ...base,
  type: 'event',
  id: 'e',
  title: 'Book Fair',
  date: '2025-01-01',
  location: 'Casita Centro',
}

const house: HouseItem = {
  ...base,
  type: 'house',
  id: 'h',
  name: 'Casita Norte',
  distance: 1.2,
}

const person: PersonItem = {
  ...base,
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

describe('Feed cards snapshots', () => {
  test.each(cases)('%s card matches snapshot (light/en)', async (_name, element) => {
    localStorage.setItem('theme', 'light')
    await i18n.changeLanguage('en')
    const { asFragment } = renderWithProviders(element)
    expect(asFragment()).toMatchSnapshot()
    localStorage.clear()
  })

  test.each(cases)('%s card matches snapshot (dark/es)', async (_name, element) => {
    localStorage.setItem('theme', 'dark')
    await i18n.changeLanguage('es')
    const { asFragment } = renderWithProviders(element)
    expect(asFragment()).toMatchSnapshot()
    localStorage.clear()
  })
})
