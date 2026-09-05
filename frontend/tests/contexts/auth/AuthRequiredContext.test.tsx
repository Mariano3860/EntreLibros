import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { useLocation } from 'react-router-dom'

import { setLoggedInState } from '@mocks/handlers/auth/me.handler'
import {
  getSafeReturnTo,
  useAuthRequired,
} from '@src/contexts/auth/AuthRequiredContext'
import { RequireAuth } from '@src/routes/RequireAuth'

import { renderWithProviders } from '../../test-utils'

const AuthActionProbe = () => {
  const { runIfAuthenticated } = useAuthRequired()

  return (
    <button type="button" onClick={() => runIfAuthenticated(() => undefined)}>
      Open auth prompt
    </button>
  )
}

const LocationProbe = () => {
  const location = useLocation()
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
      {location.hash}
    </output>
  )
}

describe('authentication-required flow', () => {
  afterEach(() => {
    setLoggedInState(false)
  })

  test('opens the auth prompt and preserves a safe return path', async () => {
    renderWithProviders(<AuthActionProbe />, {
      initialEntries: ['/books?tab=all#catalog'],
    })

    const authTrigger = await screen.findByRole('button', {
      name: 'Open auth prompt',
    })
    authTrigger.focus()
    fireEvent.click(authTrigger)
    const dialog = await screen.findByRole('dialog')
    const closeButton = screen.getByRole('button', {
      name: 'auth.required.close',
    })
    const loginButton = screen.getByRole('button', {
      name: 'auth.required.login',
    })
    expect(dialog).toBeVisible()
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    expect(loginButton).toHaveFocus()
    fireEvent.keyDown(loginButton, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(authTrigger).toHaveFocus()

    fireEvent.click(authTrigger)
    expect(await screen.findByRole('dialog')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'auth.required.login' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )

    fireEvent.click(authTrigger)
    expect(await screen.findByRole('dialog')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: 'auth.required.register' })
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )

    expect(getSafeReturnTo('/books', '?tab=all', '#catalog')).toBe(
      '/books?tab=all#catalog'
    )
    expect(getSafeReturnTo('//external.example', '', '')).toBe('/')
  })

  test('redirects a guest away from a private route with returnTo', async () => {
    renderWithProviders(
      <>
        <LocationProbe />
        <RequireAuth>
          <div>Private content</div>
        </RequireAuth>
      </>,
      { initialEntries: ['/messages?conversation=4#composer'] }
    )

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/login?returnTo=%2Fmessages%3Fconversation%3D4%23composer'
      )
    )
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
  })
})
