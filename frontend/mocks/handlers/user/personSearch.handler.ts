import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

const people = [
  {
    id: 21,
    name: 'Ana Lectura',
    alias: 'ana.lectura',
    profilePhoto: '/prototype/avatar-ana.svg',
    booksCount: 8,
    exchangeCount: 3,
    isFollowing: true,
  },
  {
    id: 22,
    name: 'Bruno Libros',
    alias: 'brunolibros',
    profilePhoto: null,
    booksCount: 2,
    exchangeCount: 0,
    isFollowing: false,
  },
]

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

export const personSearchHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.USER.SEARCH),
  ({ request }) => {
    const search = normalize(new URL(request.url).searchParams.get('q') ?? '')
    if (!search) return HttpResponse.json([])
    const searchTerm = search.startsWith('@') ? search.slice(1) : search
    return HttpResponse.json(
      people.filter((person) =>
        `${normalize(person.name)} ${normalize(person.alias)}`.includes(
          searchTerm
        )
      )
    )
  }
)

export const personFollowHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
  ({ params }) =>
    HttpResponse.json(
      { following: true, userId: String(params.id) },
      { status: 201 }
    )
)

export const personUnfollowHandler = http.delete(
  apiRouteMatcher(RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(':id')),
  ({ params }) =>
    HttpResponse.json({ following: false, userId: String(params.id) })
)
