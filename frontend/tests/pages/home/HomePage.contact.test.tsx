import { fireEvent, screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test } from 'vitest'

import { server } from '@mocks/server'
import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import { generatePublication } from '@mocks/handlers/books/fakers/publication.faker'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { HomePage } from '@src/pages/home/HomePage'

import { renderWithProviders } from '../../test-utils'

describe('HomePage book contact', () => {
  afterEach(() => {
    setLoggedInState(false)
  })

  const useThirdPartyBookDetail = () => {
    server.use(
      http.get(
        apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
        ({ params }) =>
          HttpResponse.json({
            ...generatePublication(String(params.id)),
            ownerId: '2',
            ownerName: 'Lucía pública',
          })
      )
    )
  }

  test('shows publisher attribution and opens contact for a recommended book', async () => {
    setLoggedInState(true)
    let savedDrafts = 0
    server.use(
      http.get(
        apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
        ({ params }) =>
          HttpResponse.json({
            ...generatePublication(String(params.id)),
            ownerId: '2',
            ownerName: 'Lucía pública',
          })
      ),
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.MESSAGES.CREATE_CONVERSATION),
        () =>
          HttpResponse.json({
            conversation: {
              id: 42,
              isBot: false,
              participantIds: [1, 2],
              agreementId: null,
              lastMessageSequence: 0,
              updatedAt: new Date().toISOString(),
              participantName: 'Lucía pública',
              unreadCount: 0,
            },
          })
      ),
      http.put(apiRouteMatcher(RELATIVE_API_ROUTES.MESSAGES.DRAFT(42)), () => {
        savedDrafts += 1
        return HttpResponse.json({
          draft: {
            id: 1,
            conversationId: 42,
            authorId: 1,
            body: 'Hola',
            attachmentMetadata: null,
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
      })
    )

    renderWithProviders(<HomePage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )

    expect(await screen.findByText('Lucía pública')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.contact' }))

    await waitFor(() => {
      expect(savedDrafts).toBe(1)
      expect(
        screen.queryByRole('button', { name: 'bookDetail.contact' })
      ).not.toBeInTheDocument()
    })
  })

  test('hides publisher attribution and contact for the owner', async () => {
    setLoggedInState(true)
    server.use(
      http.get(
        apiRouteMatcher(`${RELATIVE_API_ROUTES.BOOKS.LIST}/:id`),
        ({ params }) =>
          HttpResponse.json({
            ...generatePublication(String(params.id)),
            ownerId: 'u_1',
            ownerName: 'Mariano',
          })
      )
    )

    renderWithProviders(<HomePage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )

    expect(
      await screen.findByRole('button', { name: 'bookDetail.edit' })
    ).toBeVisible()
    expect(screen.queryByText('bookDetail.publishedBy')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'bookDetail.contact' })
    ).not.toBeInTheDocument()
  })

  test('gates contact for an unauthenticated visitor', async () => {
    useThirdPartyBookDetail()

    renderWithProviders(<HomePage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )

    expect(await screen.findByText('Lucía pública')).toBeVisible()
    const contactButton = screen.getByRole('button', {
      name: 'bookDetail.contact',
    })
    fireEvent.click(contactButton)
    expect(await screen.findByText('auth.required.title')).toBeVisible()
    expect(screen.queryByText('bookDetail.contacting')).not.toBeInTheDocument()
  })

  test('ignores a second contact click while the first request is pending', async () => {
    setLoggedInState(true)
    useThirdPartyBookDetail()
    let conversationsCreated = 0
    server.use(
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.MESSAGES.CREATE_CONVERSATION),
        async () => {
          conversationsCreated += 1
          await delay(50)
          return HttpResponse.json({
            conversation: {
              id: 43,
              isBot: false,
              participantIds: [1, 2],
              agreementId: null,
              lastMessageSequence: 0,
              updatedAt: new Date().toISOString(),
              participantName: 'Lucía pública',
              unreadCount: 0,
            },
          })
        }
      ),
      http.put(apiRouteMatcher(RELATIVE_API_ROUTES.MESSAGES.DRAFT(43)), () =>
        HttpResponse.json({ draft: null })
      )
    )

    renderWithProviders(<HomePage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )
    const contactButton = await screen.findByRole('button', {
      name: 'bookDetail.contact',
    })

    fireEvent.click(contactButton)
    await waitFor(() => expect(contactButton).toBeDisabled())
    fireEvent.click(contactButton)

    await waitFor(() => expect(conversationsCreated).toBe(1))
  })

  test('shows a localized error when contact cannot be opened', async () => {
    setLoggedInState(true)
    useThirdPartyBookDetail()
    server.use(
      http.post(
        apiRouteMatcher(RELATIVE_API_ROUTES.MESSAGES.CREATE_CONVERSATION),
        () => HttpResponse.json({ error: 'failed' }, { status: 500 })
      )
    )

    renderWithProviders(<HomePage />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ver Ecos del Viento Norte' })
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.contact' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'bookDetail.contactError'
    )
  })
})
