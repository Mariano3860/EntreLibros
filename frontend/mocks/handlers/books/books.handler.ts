import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'
import { generateBooks } from './fakers/books.faker'

const interestedIds = new Set<string>()

const asBoolean = (value: string | null) =>
  value === 'true' || value === '1'
    ? true
    : value === 'false' || value === '0'
      ? false
      : undefined

const normalizeCondition = (value?: string) =>
  value?.toLowerCase().replace(/\s+/g, '_') === 'muy_bueno'
    ? 'very_good'
    : value?.toLowerCase().replace(/\s+/g, '_')

const listBooks = async ({
  request,
  cookies,
}: {
  request: Request
  cookies: Record<string, string>
}) => {
  const url = new URL(request.url)
  const seedParam = url.searchParams.get('seed')
  const seed = seedParam ? Number(seedParam) : undefined
  const language = cookies.language || 'es'
  await new Promise((r) => setTimeout(r, 200))
  let books = generateBooks(seed, language).map((book) => ({
    ...book,
    type: book.isSeeking ? ('want' as const) : ('offer' as const),
    isInterested: interestedIds.has(String(book.id)),
  }))
  const query = url.searchParams.get('q')?.trim().toLowerCase()
  const condition = url.searchParams.get('condition')
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  const trade = asBoolean(url.searchParams.get('trade'))
  const sale = asBoolean(url.searchParams.get('sale'))
  if (query) {
    books = books.filter((book) =>
      `${book.title} ${book.author}`.toLowerCase().includes(query)
    )
  }
  if (condition) {
    books = books.filter(
      (book) => normalizeCondition(book.condition) === condition
    )
  }
  if (status) books = books.filter((book) => book.status === status)
  if (type) books = books.filter((book) => book.type === type)
  if (trade !== undefined)
    books = books.filter((book) => book.isForTrade === trade)
  if (sale !== undefined)
    books = books.filter((book) => book.isForSale === sale)
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
  return HttpResponse.json(books, { status: 200 })
}

export const booksHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.LIST),
  listBooks
)

export const bookInterestHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.INTEREST(':id')),
  ({ params }) => {
    const id = String(params.id)
    const interested = !interestedIds.has(id)
    if (interested) interestedIds.add(id)
    else interestedIds.delete(id)
    return HttpResponse.json({ listingId: id, interested }, { status: 200 })
  }
)

export const homeBooksHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.HOME),
  ({ request }) => {
    const offset = Number(new URL(request.url).searchParams.get('offset') ?? 0)
    const limit = 5
    const books = generateBooks()
    const items = books.slice(offset, offset + limit)

    return HttpResponse.json({
      items,
      page: {
        limit,
        offset,
        hasNext: offset + limit < books.length,
        hasPrevious: offset > 0,
      },
    })
  }
)
