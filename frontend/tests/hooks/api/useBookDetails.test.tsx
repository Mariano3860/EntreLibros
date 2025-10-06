import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { useBookDetails } from '@src/hooks/api/useBookDetails'

import { server } from '@mocks/server'

import { createWrapper } from '../../test-utils'

describe('useBookDetails', () => {
  it('fetches book details successfully', async () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useBookDetails('test-book'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('test-book')
    expect(result.current.data?.metadata.title).toBeTruthy()
  })

  it('handles not found responses', async () => {
    const notFoundRoute = RELATIVE_API_ROUTES.BOOKS.DETAIL('missing-book')
    server.use(
      http.get(notFoundRoute, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useBookDetails('missing-book'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.type).toBe('not_found')
  })
})
