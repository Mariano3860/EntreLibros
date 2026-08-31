import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { HomePage } from '@src/pages/home/HomePage'

import { renderWithProviders } from '../../test-utils'

const recommendations = Array.from({ length: 11 }, (_, index) => ({
  id: String(index + 1),
  title: `Recomendación ${index + 1}`,
  author: 'Autora lectora',
  coverUrl: 'https://covers.example.com/book.jpg',
  condition: 'good',
  status: 'available' as const,
  isForTrade: true,
}))

describe('HomePage recommendation pagination', () => {
  beforeEach(() => {
    server.use(
      http.get(
        apiRouteMatcher(RELATIVE_API_ROUTES.BOOKS.HOME),
        ({ request }) => {
          const offset = Number(
            new URL(request.url).searchParams.get('offset') ?? 0
          )
          const limit = 5
          const items = recommendations.slice(offset, offset + limit)

          return HttpResponse.json({
            items,
            page: {
              limit,
              offset,
              hasNext: offset + limit < recommendations.length,
              hasPrevious: offset > 0,
            },
          })
        }
      )
    )
  })

  test('renews the rail in groups of five and keeps keyboard focus', async () => {
    renderWithProviders(<HomePage />)

    await screen.findByRole('button', { name: 'Ver Recomendación 1' })
    const nextButton = screen.getByRole('button', {
      name: 'Ver más recomendaciones',
    })
    nextButton.focus()
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Ver Recomendación 10' })
      ).toBeVisible()
    })
    expect(
      screen.getAllByRole('button', { name: /^Ver Recomendación/ })
    ).toHaveLength(5)
    expect(nextButton).toHaveFocus()
    const previousButton = screen.getByRole('button', {
      name: 'Ver recomendaciones anteriores',
    })
    expect(previousButton).toBeEnabled()
    expect(nextButton).toHaveTextContent('>')
    expect(previousButton).toHaveTextContent('<')
  })
})
