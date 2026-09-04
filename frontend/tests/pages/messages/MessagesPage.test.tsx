import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('renders Lucia chat and sends a message', () => {
    renderWithProviders(<MessagesPage />)

    expect(screen.getAllByText('Lucia').length).toBeGreaterThan(0)
    const input = screen.getByPlaceholderText('Escribí un mensaje...')
    fireEvent.change(input, { target: { value: 'Nos vemos mañana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText('Nos vemos mañana')).toBeVisible()
  })

  test('shows every user book and attaches the selected book', () => {
    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjuntar libro' }))
    expect(
      screen.getAllByRole('button', { name: /Ecos del Viento Norte/ }).length
    ).toBeGreaterThan(0)
    const choice = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Ecos del Viento Norte'))
    expect(choice).toBeDefined()
    fireEvent.click(choice!)
    expect(screen.getAllByText('Libro adjunto').length).toBeGreaterThan(0)
  })

  test('creates an exchange proposal in the chat', () => {
    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Proponer intercambio' })
    )
    const choice = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Ecos del Viento Norte'))
    fireEvent.click(choice!)
    expect(
      screen.getAllByText('Propuesta de intercambio').length
    ).toBeGreaterThan(0)
  })

  test('recovers a draft after remount and keeps it isolated by conversation', async () => {
    localStorage.clear()
    localStorage.setItem(
      'entrelibros:prototype:message-drafts:mariano',
      JSON.stringify({
        lucia: {
          id: 1,
          conversationId: 2,
          authorId: 1,
          body: 'Borrador persistente',
          attachmentMetadata: null,
          revision: 1,
          createdAt: '2026-09-04T10:00:00.000Z',
          updatedAt: '2026-09-04T10:00:00.000Z',
        },
      })
    )
    const firstRender = renderWithProviders(<MessagesPage />)
    expect(await screen.findByText('Borrador persistente')).toBeVisible()
    firstRender.unmount()
    renderWithProviders(<MessagesPage />)
    expect(await screen.findByText('Borrador persistente')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: /Sofia/i }))
    expect(screen.queryByText('Borrador persistente')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Lucia/ }))
    expect(screen.getByText('Borrador persistente')).toBeVisible()
  })

  test('sends the current draft from the composer submit button', async () => {
    localStorage.clear()
    renderWithProviders(<MessagesPage />)
    const input = screen.getByPlaceholderText(/Escrib.*mensaje/)
    fireEvent.change(input, { target: { value: 'Mensaje desde submit' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Borrador: Mensaje' })
      ).not.toBeInTheDocument()
    )
    expect(screen.getByText('Mensaje desde submit')).toBeVisible()
  })

  test('sends and removes a saved mock draft from the card button', async () => {
    localStorage.clear()
    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjuntar libro' }))
    fireEvent.click(
      await screen.findByRole('button', { name: /Ecos del Viento Norte/ })
    )

    const draftCard = await screen.findByRole('article', {
      name: 'Borrador: Libro adjunto',
    })
    fireEvent.click(within(draftCard).getByRole('button', { name: 'Enviar' }))

    await waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Borrador: Libro adjunto' })
      ).not.toBeInTheDocument()
    )
  })
})
