import type { FeedItem } from '@components/feed/FeedItem.types'

import { prototypeCatalog } from '@src/features/prototype/catalog'

const requester = {
  id: 'user-lucia',
  displayName: 'Lucia',
  username: '@lucia',
  avatar: '',
}

const mariano = {
  id: 'user-mariano',
  displayName: 'Mariano',
  username: '@mariano',
  avatar: '',
}

const ITEMS: FeedItem[] = [
  {
    id: 'story-lucia-reading',
    type: 'story',
    user: 'Lucia',
    avatar: '',
    time: 'hace 24 minutos',
    likes: 42,
    title: 'Una tarde para leer',
    body: 'Encontré el rincón perfecto para terminar un libro un domingo.',
    image: '/prototype/community-reading.svg',
    corner: { id: 'cafe-literario', name: 'Café Literario' },
  },
  {
    id: 'book-ecos',
    type: 'book',
    user: 'Lucia',
    avatar: '',
    time: 'hace 1 hora',
    likes: 28,
    title: prototypeCatalog.books[0].title,
    author: prototypeCatalog.books[0].author,
    cover: '/prototype/book-cover.svg',
  },
  {
    id: 'swap-ecos',
    type: 'swap',
    user: 'Lucia',
    avatar: '',
    time: 'hace 2 horas',
    likes: 16,
    requester,
    offered: {
      id: prototypeCatalog.books[0].id,
      title: prototypeCatalog.books[0].title,
      author: prototypeCatalog.books[0].author,
      cover: '/prototype/book-cover.svg',
      category: 'book',
      owner: requester,
    },
    requested: {
      id: prototypeCatalog.books[1].id,
      title: prototypeCatalog.books[1].title,
      author: prototypeCatalog.books[1].author,
      cover: '/prototype/book-cover.svg',
      category: 'book',
      owner: mariano,
    },
  },
]

export const generateFeedItems = (
  page = 0,
  size = 8,
  seed?: number
): FeedItem[] => {
  void seed
  return page === 0 ? ITEMS.slice(0, size) : []
}
