import { FeedItem } from '@components/feed/FeedItem.types'
import { describe, expect, test } from 'vitest'

import { filterItems } from '@src/components/feed/filterItems'

const feedMock: FeedItem[] = [
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
    requester: 'Ana',
    offered: '1984',
    requested: 'The Hobbit',
  },
]

describe('filterItems', () => {
  test('returns all items for all filter', () => {
    expect(filterItems(feedMock, 'all').length).toBe(feedMock.length)
  })

  test('returns only books when filtering book', () => {
    const books = filterItems(feedMock, 'book')
    expect(books.every((i) => i.type === 'book')).toBe(true)
  })
})
