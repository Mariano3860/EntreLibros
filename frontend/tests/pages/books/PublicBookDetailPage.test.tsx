import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'

const fetchMe = vi.hoisted(() => vi.fn())
const contactMutate = vi.hoisted(() => vi.fn())

vi.mock('@src/api/auth/me.service', () => ({ fetchMe }))
vi.mock('@src/hooks/useBookContact', () => ({
  useBookContact: ({
    onSuccess,
  }: {
    onSuccess: (conversation: { id: number }) => void
  }) => ({
    isPending: false,
    isError: false,
    mutate: (input: unknown) => {
      contactMutate(input)
      onSuccess({ id: 99 })
    },
  }),
}))

import { PublicBookDetailPage } from '@src/pages/books/PublicBookDetailPage'

import { renderWithProviders } from '../../test-utils'

describe('PublicBookDetailPage', () => {
  test('renders a public publication for visitors without exposing the personal index', async () => {
    fetchMe.mockRejectedValueOnce(new Error('unauthenticated'))

    renderWithProviders(
      <Routes>
        <Route path="/books/:id" element={<PublicBookDetailPage />} />
      </Routes>,
      { initialEntries: ['/books/1'] }
    )

    expect(await screen.findByText('1984')).toBeVisible()
    expect(screen.getByText('George Orwell')).toBeVisible()
    expect(
      screen.queryByRole('link', { name: 'pages.books' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.contact' }))
    expect(
      await screen.findByRole('heading', { name: 'auth.required.title' })
    ).toBeVisible()
  })

  test('keeps the public detail navigable and contacts the owner after login', async () => {
    fetchMe.mockResolvedValueOnce({ id: 2, name: 'Reader' })
    contactMutate.mockReset()

    renderWithProviders(
      <Routes>
        <Route path="/books/:id" element={<PublicBookDetailPage />} />
        <Route path="/messages" element={<span>messages-route</span>} />
        <Route path="/community" element={<span>community-route</span>} />
      </Routes>,
      { initialEntries: ['/books/1'] }
    )

    expect(await screen.findByText('1984')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'bookDetail.contact' }))

    expect(contactMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'u_1',
        book: expect.objectContaining({
          title: '1984',
          author: 'George Orwell',
        }),
      })
    )
    expect(await screen.findByText('messages-route')).toBeVisible()

    fetchMe.mockRejectedValueOnce(new Error('unauthenticated'))
    renderWithProviders(
      <Routes>
        <Route path="/books/:id" element={<PublicBookDetailPage />} />
        <Route path="/community" element={<span>community-route</span>} />
      </Routes>,
      { initialEntries: ['/books/1'] }
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'bookDetail.close' })
    )
    expect(await screen.findByText('community-route')).toBeVisible()
  })
})
