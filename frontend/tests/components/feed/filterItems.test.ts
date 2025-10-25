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
