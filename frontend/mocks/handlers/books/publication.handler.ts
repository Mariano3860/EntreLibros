import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import {
  Publication,
  PublicationUpdate,
} from '@src/api/books/publication.types'

import { apiRouteMatcher } from '../utils'
import { generatePublication } from './fakers/publication.faker'

// In-memory store for updates
const publicationsStore = new Map<string, Publication>()

export const publicationHandlers = [
  // GET /api/books/:id
  http.get(
    apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
    async ({ params }) => {
      const { id } = params as { id: string }

      await new Promise((r) => setTimeout(r, 300))

      // Check if we have an updated version in store
      if (publicationsStore.has(id)) {
        return HttpResponse.json(publicationsStore.get(id), { status: 200 })
      }

      // Return mock data for known IDs
      if (id === '1' || id === '2' || id === '3') {
        const publication = generatePublication(id)
        return HttpResponse.json(publication, { status: 200 })
      }

      // Return 404 for unknown IDs
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }
  ),

  // PUT /api/books/:id
  http.put(
    apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
    async ({ params, request }) => {
      const { id } = params as { id: string }
      const updates = (await request.json()) as PublicationUpdate

      await new Promise((r) => setTimeout(r, 400))

      // Simulate validation error
      if (updates.title === '') {
        return HttpResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        )
      }

      // Simulate permission error
      if (id === '999') {
        return HttpResponse.json(
          { error: 'You are not the owner of this publication' },
          { status: 403 }
        )
      }

      // Get existing or generate new
      const existing = publicationsStore.get(id) || generatePublication(id)

      // Apply updates
      const updated: Publication = {
        ...existing,
        ...updates,
        id,
        offer: updates.offer
          ? {
              ...existing.offer,
              ...updates.offer,
              delivery: updates.offer.delivery
                ? {
                    ...existing.offer.delivery,
                    ...updates.offer.delivery,
                  }
                : existing.offer.delivery,
            }
          : existing.offer,
        updatedAt: new Date().toISOString(),
      }

      // Store the updated publication
      publicationsStore.set(id, updated)

      return HttpResponse.json(updated, { status: 200 })
    }
  ),
]
