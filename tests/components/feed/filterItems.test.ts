import { describe, expect, test } from 'vitest'

import { feedMock } from '@mocks/data/feed.mock'
import { filterItems } from '@src/components/feed/filterItems'

describe('filterItems', () => {
  test('returns all items for all filter', () => {
    expect(filterItems(feedMock, 'all').length).toBe(feedMock.length)
  })

  test('returns only books when filtering book', () => {
    const books = filterItems(feedMock, 'book')
    expect(books.every((i) => i.type === 'book')).toBe(true)
  })
})
