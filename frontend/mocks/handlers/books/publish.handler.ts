import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { PublishBookPayload } from '@src/api/books/publishBook.types'

import { apiRouteMatcher } from '../utils'

let lastGeneratedId = 5000
const publishedWantKeys = new Set<string>()

export const publishBookHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.PUBLISH),
  async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const body = (await request.json()) as PublishBookPayload

    if (body.metadata?.title?.toLowerCase?.().includes('error')) {
      return HttpResponse.json({ message: 'publish failed' }, { status: 500 })
    }

    if (body.type === 'want') {
      const key = `${body.metadata?.isbn ?? ''}|${body.metadata?.title ?? ''}|${body.metadata?.author ?? ''}`
      if (publishedWantKeys.has(key)) {
        return HttpResponse.json(
          { message: 'books.errors.want_duplicate' },
          { status: 409 }
        )
      }
      publishedWantKeys.add(key)
    }

    const id = `book-${++lastGeneratedId}`

    const priceAmount = body.offer?.price?.amount

    return HttpResponse.json(
      {
        id,
        title: body.metadata?.title,
        author: body.metadata?.author,
        coverUrl:
          body.metadata?.coverUrl ??
          body.images?.[0]?.url ??
          'https://placehold.co/400x600',
        condition: body.offer?.condition,
        status: 'available',
        isForSale: body.offer?.sale,
        price: body.offer?.sale ? priceAmount : undefined,
        isForTrade: body.offer?.trade,
        tradePreferences: body.offer?.tradePreferences ?? [],
        isSeeking: body.type === 'want',
        type: body.type ?? 'offer',
        publisher: body.metadata?.publisher,
        year: body.metadata?.year,
        language: body.metadata?.language,
        format: body.metadata?.format,
        isbn: body.metadata?.isbn,
        availability: body.offer?.availability,
        delivery: body.offer?.delivery,
      },
      { status: 201 }
    )
  }
)
