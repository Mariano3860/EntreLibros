import { describe, expect, it } from 'vitest'

import {
  formatPrototypeTime,
  toPrototypeBook,
  toPrototypeChatMessage,
  toPrototypeConversation,
  toPrototypeProfile,
} from './realData.adapters'

describe('prototype real-data adapters', () => {
  it('maps optional book fields to a content-safe card model', () => {
    expect(
      toPrototypeBook({
        id: 'book-1',
        title: 'Una novela',
        author: '',
        coverUrl: ' https://example.com/cover.jpg ',
        condition: 'very_good',
        isForSale: true,
        price: 12500,
      })
    ).toMatchObject({
      author: 'Autor desconocido',
      coverUrl: 'https://example.com/cover.jpg',
      mode: 'Venta',
      price: '$12.500',
      genre: 'Very Good',
    })
  })

  it('maps profile privacy-safe display fields without requiring extended mock metrics', () => {
    expect(
      toPrototypeProfile({
        id: 7,
        name: 'Mariano',
        alias: 'mariano_lector',
        email: 'mariano@example.test',
        language: 'es',
        profileDescription: null,
        profilePhoto: null,
        profileVisibility: 'public',
        locationVisibility: 'neighborhood',
        location: null,
        interests: ['science-fiction'],
        country: 'Argentina',
        city: 'Buenos Aires',
        neighborhood: 'Palermo',
        street: 'Av. Santa Fe 1234',
      })
    ).toEqual({
      id: 7,
      name: 'mariano_lector',
      username: '@mariano_lector',
      initials: 'M',
      profilePhoto: null,
      city: 'Palermo · Buenos Aires · Argentina',
      bio: '',
      interests: ['Science Fiction'],
    })
  })

  it('maps persisted conversation messages and attachment metadata', () => {
    const now = new Date('2026-08-30T12:00:00.000Z')
    expect(
      toPrototypeConversation(
        {
          id: 12,
          isBot: false,
          participantIds: [1, 2],
          agreementId: null,
          lastMessageSequence: 4,
          updatedAt: '2026-08-30T11:59:00.000Z',
          participantName: 'Lucía',
          unreadCount: 2,
        },
        { preview: 'Hola', unread: 2, now }
      )
    ).toMatchObject({
      name: 'Lucía',
      preview: 'Hola',
      unread: 2,
      time: 'hace 1 min',
    })
    expect(
      toPrototypeChatMessage(
        {
          id: 5,
          conversationId: 12,
          senderId: 2,
          sequence: 5,
          clientKey: 'key',
          body: 'Libro adjunto',
          attachmentMetadata: {
            key: 'book',
            contentType: 'application/json',
            size: 1,
            kind: 'book',
            bookId: 'listing-1',
            title: 'Libro adjunto',
            author: 'Autora',
            coverUrl: '/cover.jpg',
          },
          createdAt: '2026-08-30T11:59:00.000Z',
        },
        1,
        now
      )
    ).toMatchObject({ role: 'them', kind: 'book', time: 'hace 1 min' })
  })

  it('maps swap and agreement attachments to their rich bubble models', () => {
    const common = {
      conversationId: 12,
      senderId: 2,
      clientKey: 'key',
      createdAt: '2026-08-30T11:59:00.000Z',
    }
    const book = {
      id: 'listing-1',
      title: 'Libro de intercambio',
      author: 'Autora',
      coverUrl: '/cover.jpg',
    }
    expect(
      toPrototypeChatMessage(
        {
          ...common,
          id: 6,
          sequence: 6,
          body: '¿Te interesa?',
          attachmentMetadata: {
            key: 'swap',
            contentType: 'application/x-entrelibros-swap',
            size: 1,
            kind: 'swap',
            offered: book,
            requested: { ...book, id: 'listing-2', title: 'Otro libro' },
            note: 'Podemos encontrarnos el sábado',
          },
        },
        1
      )
    ).toMatchObject({
      kind: 'swap',
      swap: { offered: { id: 'listing-1' }, requested: { id: 'listing-2' } },
    })
    expect(
      toPrototypeChatMessage(
        {
          ...common,
          id: 7,
          sequence: 7,
          body: '',
          attachmentMetadata: {
            key: 'agreement',
            contentType: 'application/x-entrelibros-agreement',
            size: 1,
            kind: 'agreement',
            agreementId: 4,
            version: 1,
            event: 'proposal',
            details: {
              meetingPoint: 'Biblioteca',
              area: 'Centro',
              date: '2026-09-01',
              time: '18:00',
              bookTitle: 'Libro de intercambio',
            },
            listingIds: [1],
            actorName: 'Lucía',
          },
        },
        1
      )
    ).toMatchObject({
      kind: 'agreement',
      agreement: {
        agreementId: 4,
        event: 'proposal',
        bookTitle: 'Libro de intercambio',
      },
    })
  })

  it('does not fabricate a timestamp for malformed persisted dates', () => {
    expect(formatPrototypeTime('not-a-date')).toBe('')
  })
})
