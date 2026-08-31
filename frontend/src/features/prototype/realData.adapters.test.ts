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
        profileVisibility: 'public',
        locationVisibility: 'neighborhood',
        location: null,
        interests: ['science-fiction'],
        city: 'Buenos Aires',
        neighborhood: 'Palermo',
      })
    ).toEqual({
      id: 7,
      name: 'mariano_lector',
      username: '@mariano_lector',
      initials: 'M',
      city: 'Palermo · Buenos Aires',
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
          },
          createdAt: '2026-08-30T11:59:00.000Z',
        },
        1,
        now
      )
    ).toMatchObject({ role: 'them', kind: 'book', time: 'hace 1 min' })
  })

  it('does not fabricate a timestamp for malformed persisted dates', () => {
    expect(formatPrototypeTime('not-a-date')).toBe('')
  })
})
