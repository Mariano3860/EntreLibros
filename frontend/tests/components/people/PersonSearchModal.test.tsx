import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { server } from '@mocks/server'
import { apiRouteMatcher } from '@mocks/handlers/utils'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { PersonSearchModal } from '@components/people/PersonSearchModal/PersonSearchModal'

import { renderWithProviders } from '../../test-utils'

const LocationProbe = () => (
  <output data-testid="location">{useLocation().pathname}</output>
)

describe('PersonSearchModal', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('opens with focus in the search field and renders matching people', async () => {
    const onClose = vi.fn()
    renderWithProviders(<PersonSearchModal isOpen onClose={onClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveFocus()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'ana' },
    })

    expect(await screen.findByText('Ana Lectura')).toBeVisible()
    expect(screen.getByText('@ana.lectura')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'booksPage.personSearch.following' })
    ).toBeVisible()
  })

  test('handles empty and error states without keeping stale results', async () => {
    renderWithProviders(<PersonSearchModal isOpen onClose={() => {}} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'zzzz' } })
    expect(
      await screen.findByText('booksPage.personSearch.empty')
    ).toBeVisible()

    server.use(
      http.get(apiRouteMatcher(RELATIVE_API_ROUTES.USER.SEARCH), () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 })
      )
    )
    fireEvent.change(input, { target: { value: 'error' } })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'booksPage.personSearch.error'
    )
    expect(screen.queryByText('Ana Lectura')).not.toBeInTheDocument()
  })

  test('updates follow state only after success and keeps it on failure', async () => {
    renderWithProviders(<PersonSearchModal isOpen onClose={() => {}} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'bruno' },
    })
    expect(await screen.findByText('Bruno Libros')).toBeVisible()

    const follow = screen.getByRole('button', {
      name: 'booksPage.personSearch.follow',
    })
    fireEvent.click(follow)
    expect(
      await screen.findByRole('button', {
        name: 'booksPage.personSearch.following',
      })
    ).toBeVisible()
    expect(follow).toBeEnabled()

    server.use(
      http.delete(
        apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
        () => HttpResponse.json({ message: 'failed' }, { status: 500 })
      )
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.personSearch.following' })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'booksPage.personSearch.followError'
    )
    expect(
      screen.getByRole('button', { name: 'booksPage.personSearch.following' })
    ).toBeVisible()
  })

  test('navigates to the profile, closes, and stores reusable non-email searches', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <>
        <PersonSearchModal isOpen onClose={onClose} />
        <LocationProbe />
      </>,
      { initialEntries: ['/books'] }
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'ana' },
    })
    expect(await screen.findByText('Ana Lectura')).toBeVisible()

    fireEvent.click(
      screen.getByRole('button', { name: 'booksPage.personSearch.viewProfile' })
    )
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/profile/21')
    expect(
      window.localStorage.getItem('entrelibros.person-search.recent')
    ).toContain('ana')
  })

  test('reuses a recent search and clears it locally without a new initial request', async () => {
    const onClose = vi.fn()
    const { rerender } = renderWithProviders(
      <PersonSearchModal isOpen onClose={onClose} />
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'ana' },
    })
    expect(await screen.findByText('Ana Lectura')).toBeVisible()

    rerender(<PersonSearchModal isOpen={false} onClose={onClose} />)
    rerender(<PersonSearchModal isOpen onClose={onClose} />)
    expect(
      screen.getByRole('heading', {
        name: 'booksPage.personSearch.recentTitle',
      })
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'ana' }))
    expect(screen.getByRole('textbox')).toHaveValue('ana')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(
      screen.getByRole('button', {
        name: 'booksPage.personSearch.removeRecent',
      })
    )
    expect(
      window.localStorage.getItem('entrelibros.person-search.recent')
    ).toBe('[]')
  })

  test('traps Tab and closes on Escape', async () => {
    const onClose = vi.fn()
    renderWithProviders(<PersonSearchModal isOpen onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    const close = screen.getByRole('button', {
      name: 'booksPage.personSearch.close',
    })
    close.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })
})
