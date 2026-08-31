import type { ApiBook } from '@api/books/books.types'
import type { ApiConversation, ApiMessage } from '@api/messages/messages'
import type { UserProfile } from '@api/user/profile.types'

import type {
  PrototypeBook,
  PrototypeChatMessage,
  PrototypeConversation,
} from './catalog'

const accents = ['#42d7c7', '#dd7b62', '#6e85b5', '#9a78aa', '#5c9b83']

const titleCase = (value: string) =>
  value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')

const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || '?'

const accentFor = (value: string) => {
  const hash = [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  )
  return accents[hash % accents.length]
}

export type PrototypeProfileView = {
  id: number
  name: string
  username: string
  initials: string
  city: string
  bio: string
  interests: string[]
}

export const toPrototypeProfile = (
  profile: UserProfile
): PrototypeProfileView => ({
  id: profile.id,
  name: profile.alias || profile.name,
  username: `@${profile.alias || profile.name}`,
  initials: initials(profile.alias || profile.name),
  city: [profile.neighborhood, profile.city].filter(Boolean).join(' · '),
  bio: profile.profileDescription ?? '',
  interests: profile.interests.map(titleCase),
})

export const toPrototypeBook = (
  book: ApiBook,
  options: { owner?: string; distance?: string } = {}
): PrototypeBook => {
  const mode: PrototypeBook['mode'] = book.isSeeking
    ? 'Buscado'
    : book.isForSale
      ? 'Venta'
      : 'Intercambio'

  return {
    id: String(book.id),
    title: book.title,
    author: book.author || 'Autor desconocido',
    owner: options.owner ?? 'Miembro de EntreLibros',
    distance: options.distance ?? 'Ubicación disponible',
    mode,
    ...(book.price !== undefined && book.price !== null
      ? { price: `$${book.price.toLocaleString('es-AR')}` }
      : {}),
    ...(book.coverUrl?.trim() ? { coverUrl: book.coverUrl.trim() } : {}),
    accent: accentFor(String(book.id)),
    genre: book.condition ? titleCase(book.condition) : 'Libro',
  }
}

export const mergeApiBooks = (
  ...sources: ReadonlyArray<ReadonlyArray<ApiBook> | undefined>
): ApiBook[] =>
  Array.from(
    new Map(
      sources
        .flatMap((source) => source ?? [])
        .map((book) => [String(book.id), book] as const)
    ).values()
  )

export const formatPrototypeTime = (value: string, now = new Date()) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000)
  )
  if (elapsedMinutes < 1) return 'Ahora'
  if (elapsedMinutes < 60) return `hace ${elapsedMinutes} min`
  if (elapsedMinutes < 24 * 60) {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (elapsedMinutes < 48 * 60) return 'Ayer'
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export const toPrototypeConversation = (
  conversation: ApiConversation,
  options: { preview?: string; unread?: number; now?: Date } = {}
): PrototypeConversation => {
  const name =
    conversation.participantName ??
    (conversation.isBot ? 'Bot' : 'Conversación')
  return {
    id: String(conversation.id),
    name,
    initials: initials(name),
    preview: options.preview ?? 'Todavía no hay mensajes',
    time: formatPrototypeTime(conversation.updatedAt, options.now),
    ...(options.unread ? { unread: options.unread } : {}),
    accent: accentFor(String(conversation.id)),
  }
}

export const toPrototypeChatMessage = (
  message: ApiMessage,
  currentUserId: number,
  now?: Date
): PrototypeChatMessage => ({
  id: String(message.id),
  role: message.senderId === currentUserId ? 'me' : 'them',
  text: message.body,
  time: formatPrototypeTime(message.createdAt, now),
  ...(message.attachmentMetadata?.kind === 'book' ? { kind: 'book' } : {}),
})
