import type { FeedItem } from '@components/feed/FeedItem.types'

const base: FeedItem[] = [
  { type: 'book', id: 'b1', title: 'Dune', author: 'Frank Herbert', cover: '' },
  {
    type: 'swap',
    id: 's1',
    requester: 'Ana',
    offered: '1984',
    requested: 'The Hobbit',
  },
  { type: 'sale', id: 'sa1', title: 'Foundation', price: 10, condition: 'used' },
  { type: 'seeking', id: 'se1', user: 'Luis', title: 'Sapiens' },
  {
    type: 'review',
    id: 'r1',
    user: 'Maria',
    book: 'Dune',
    quote: 'Great book!',
    rating: 5,
  },
  {
    type: 'event',
    id: 'e1',
    title: 'Book Fair',
    date: '2025-01-01',
    location: 'Casita Centro',
  },
  { type: 'house', id: 'h1', name: 'Casita Norte', distance: 0.8 },
  {
    type: 'person',
    id: 'p1',
    name: 'Carlos',
    match: 85,
    lastActivity: 'yesterday',
  },
]

export const feedMock: FeedItem[] = Array.from({ length: 20 }).flatMap((_, idx) =>
  base.map((item) => ({ ...item, id: item.id + '-' + idx }))
)

export default feedMock
