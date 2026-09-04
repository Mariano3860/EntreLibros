import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import type { ApiMessageDraft } from '@src/api/messages/messages'
import { MessageDraftCard } from '@src/components/messages/drafts/MessageDraftCard'

import { renderWithProviders } from '../../test-utils'

const details = {
  meetingPoint: 'Biblioteca central',
  area: 'Centro',
  date: '2026-09-10',
  time: '18:00',
  bookTitle: 'Ecos del Viento Norte',
}

const baseDraft: ApiMessageDraft = {
  id: 1,
  conversationId: 4,
  authorId: 2,
  body: 'Hola, ¿te interesa?',
  attachmentMetadata: null,
  revision: 1,
  createdAt: '2026-09-04T10:00:00.000Z',
  updatedAt: '2026-09-04T10:00:00.000Z',
}

const callbacks = () => ({
  onEdit: vi.fn(),
  onDiscard: vi.fn(),
  onSend: vi.fn(),
})

describe('MessageDraftCard', () => {
  test.each([
    ['text', baseDraft],
    [
      'book',
      {
        ...baseDraft,
        body: 'Te lo recomiendo',
        attachmentMetadata: {
          key: 'book:1',
          contentType: 'application/x-entrelibros-book',
          size: 1,
          kind: 'book' as const,
          bookId: '1',
          title: 'Ecos del Viento Norte',
          author: 'Clara Montiel',
          coverUrl: '/prototype/book-cover.svg',
        },
      },
    ],
    [
      'swap',
      {
        ...baseDraft,
        body: '',
        attachmentMetadata: {
          key: 'swap:1:2',
          contentType: 'application/x-entrelibros-swap',
          size: 1,
          kind: 'swap' as const,
          offered: {
            id: '1',
            title: 'Ecos del Viento Norte',
            author: 'Clara Montiel',
            coverUrl: '/prototype/book-cover.svg',
          },
          requested: {
            id: '2',
            title: 'El libro de Lucia',
            author: 'Lucia Fernández',
            coverUrl: '/prototype/book-cover.svg',
          },
          note: '¿Te parece el viernes?',
        },
      },
    ],
    [
      'agreement',
      {
        ...baseDraft,
        body: '',
        attachmentMetadata: {
          key: 'agreement-proposal:1',
          contentType: 'application/x-entrelibros-agreement-proposal',
          size: 1,
          kind: 'agreementProposal' as const,
          listingIds: [1],
          details,
        },
      },
    ],
  ])('renders the %s center with its actions', (_kind, draft) => {
    const handlers = callbacks()
    renderWithProviders(<MessageDraftCard draft={draft} {...handlers} />)

    expect(screen.getByText('Borrador')).toBeVisible()
    expect(
      screen.getByText('Solo vos ves este borrador hasta enviarlo')
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    fireEvent.click(screen.getByRole('button', { name: /Enviar/ }))

    expect(handlers.onEdit).toHaveBeenCalledOnce()
    expect(handlers.onDiscard).toHaveBeenCalledOnce()
    expect(handlers.onSend).toHaveBeenCalledOnce()
  })

  test('keeps agreement details visible in the variable center', () => {
    const handlers = callbacks()
    renderWithProviders(
      <MessageDraftCard
        draft={{
          ...baseDraft,
          body: '',
          attachmentMetadata: {
            key: 'agreement-proposal:1',
            contentType: 'application/x-entrelibros-agreement-proposal',
            size: 1,
            kind: 'agreementProposal',
            listingIds: [1],
            details,
          },
        }}
        {...handlers}
      />
    )

    expect(screen.getByText(details.bookTitle)).toBeVisible()
    expect(
      screen.getByText(`${details.meetingPoint} · ${details.area}`)
    ).toBeVisible()
    expect(screen.getByText(`${details.date} · ${details.time}`)).toBeVisible()
  })
})
