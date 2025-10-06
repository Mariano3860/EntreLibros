import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import type { Publication } from '@src/api/books/publication.types'
import { useBookDetails } from '@src/hooks/api/useBookDetails'
import { useUpdateBook } from '@src/hooks/api/useUpdateBook'

import { publicationStore } from '@mocks/handlers/books/fakers/publications.faker'
import { server } from '@mocks/server'

import { createWrapper } from '../../test-utils'

describe('useUpdateBook', () => {
  it('updates the publication and refreshes the cache', async () => {
    publicationStore.ensure('editable-book', {
      isOwner: true,
      notes: 'Initial notes',
    })

    const { Wrapper, queryClient } = createWrapper()

    const { result: detailsResult, unmount: unmountDetails } = renderHook(
      () => useBookDetails('editable-book'),
      { wrapper: Wrapper }
    )

    await waitFor(() => expect(detailsResult.current.isSuccess).toBe(true))
    expect(detailsResult.current.data?.notes).toBe('Initial notes')

    unmountDetails()

    const { result } = renderHook(() => useUpdateBook('editable-book'), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({ notes: 'Updated notes' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const updated = queryClient.getQueryData<Publication>([
      'book',
      'editable-book',
    ])

    if (!updated) {
      throw new Error('Expected book details in cache after update')
    }

    expect(updated.notes).toBe('Updated notes')
    expect(publicationStore.get('editable-book')?.notes).toBe('Updated notes')
  })

  it('surface forbidden errors', async () => {
    publicationStore.ensure('readonly-book', {
      isOwner: false,
      notes: 'Notes',
    })

    const forbiddenRoute = RELATIVE_API_ROUTES.BOOKS.DETAIL('readonly-book')
    server.use(
      http.put(forbiddenRoute, () =>
        HttpResponse.json(
          { message: 'Forbidden' },
          {
            status: 403,
          }
        )
      )
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateBook('readonly-book'), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ notes: 'Attempt' })
      ).rejects.toMatchObject({ type: 'forbidden' })
    })
  })
})
