import { http, HttpResponse } from 'msw'

import type {
  ApiBook,
  PersonalBookRelationsTab,
} from '@src/api/books/books.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateBookRelations } from './fakers/relations.faker'

const asBoolean = (value: string | null) =>
  value === 'true' || value === '1'
    ? true
    : value === 'false' || value === '0'
      ? false
      : undefined

const matchesTab = (book: ApiBook, tab: PersonalBookRelationsTab) => {
  if (tab === 'trade') return book.type === 'offer' && book.isForTrade
  if (tab === 'sale') return book.type === 'offer' && book.isForSale
  if (tab === 'seeking') return book.type === 'want' || book.isSeeking
  return (
    book.type === 'want' || Boolean(book.isForTrade) || Boolean(book.isForSale)
  )
}

export const bookRelationsHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.RELATIONS),
  async ({ request }) => {
    const url = new URL(request.url)
    const tab = (url.searchParams.get('tab') ??
      'all') as PersonalBookRelationsTab
    await new Promise((resolve) => setTimeout(resolve, 200))

    const commonBooks = generateBookRelations().filter((book) => {
      const query = url.searchParams.get('q')?.trim().toLowerCase()
      const type = url.searchParams.get('type')
      const condition = url.searchParams.get('condition')
      const status = url.searchParams.get('status')
      const trade = asBoolean(url.searchParams.get('trade'))
      const sale = asBoolean(url.searchParams.get('sale'))
      if (
        query &&
        !`${book.title} ${book.author}`.toLowerCase().includes(query)
      ) {
        return false
      }
      if (type && book.type !== type) return false
      if (condition && book.condition !== condition) return false
      if (status && book.status !== status) return false
      if (trade !== undefined && book.isForTrade !== trade) return false
      if (sale !== undefined && book.isForSale !== sale) return false
      return true
    })
    const categorized = (category: PersonalBookRelationsTab) =>
      commonBooks.filter((book) => matchesTab(book, category))
    const books = categorized(tab)
    const sort = url.searchParams.get('sort')
    if (sort === 'price_asc' || sort === 'price_desc') {
      books.sort((a, b) => {
        const priceA = a.price ?? null
        const priceB = b.price ?? null
        if (priceA === null && priceB === null) return 0
        if (priceA === null) return 1
        if (priceB === null) return -1
        return sort === 'price_asc' ? priceA - priceB : priceB - priceA
      })
    }
    const limit = Math.min(
      Math.max(Number(url.searchParams.get('limit') ?? 50), 1),
      100
    )
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0)

    return HttpResponse.json({
      items: books.slice(offset, offset + limit),
      page: {
        limit,
        offset,
        total: books.length,
        hasNext: offset + limit < books.length,
        hasPrevious: offset > 0,
      },
      counts: {
        all: categorized('all').length,
        trade: categorized('trade').length,
        sale: categorized('sale').length,
        seeking: categorized('seeking').length,
      },
    })
  }
)
