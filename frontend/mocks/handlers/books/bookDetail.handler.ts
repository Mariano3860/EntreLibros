import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { publicationStore } from './fakers/publications.faker'
import type { PublicationUpdate } from '@src/api/books/publication.types'

const BOOK_DETAIL_ROUTE = RELATIVE_API_ROUTES.BOOKS.DETAIL(':id')

export const bookDetailHandler = http.get(
  BOOK_DETAIL_ROUTE,
  async ({ params }) => {
    const id = params.id
    if (typeof id !== 'string' || !id) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    await new Promise((resolve) => setTimeout(resolve, 120))

    const publication = publicationStore.ensure(id)

    return HttpResponse.json(publication, { status: 200 })
  }
)

export const updateBookHandler = http.put(
  BOOK_DETAIL_ROUTE,
  async ({ params, request }) => {
    const id = params.id
    if (typeof id !== 'string' || !id) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const publication = publicationStore.get(id)

    if (!publication) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    if (!publication.isOwner) {
      return HttpResponse.json(
        { message: 'Solo el dueño puede editar esta publicación.' },
        { status: 403 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >
    const errors: Record<string, string[]> = {}

    const metadata =
      typeof body.metadata === 'object' && body.metadata
        ? (body.metadata as Record<string, unknown>)
        : undefined

    if (metadata) {
      const title = metadata.title
      if (typeof title === 'string' && title.trim().length === 0) {
        errors.metadata = ['El título no puede estar vacío.']
      }
    }

    if ('price' in body && body.price) {
      const price = body.price as Record<string, unknown>
      if (
        'amount' in price &&
        price.amount !== null &&
        typeof price.amount !== 'number'
      ) {
        errors.price = ['El precio debe ser un número o null.']
      }
    }

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { message: 'La publicación contiene errores.', errors },
        { status: 400 }
      )
    }

    const updated = publicationStore.update(id, body as PublicationUpdate)

    return HttpResponse.json(updated, { status: 200 })
  }
)
