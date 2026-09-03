import { apiClient } from '@api/axios'
import { RELATIVE_API_ROUTES } from '@api/routes'

import type { PersonSearchResult } from './personSearch.types'

export type PersonFollowResponse = {
  following: boolean
  userId: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

const normalizePerson = (value: unknown): PersonSearchResult | null => {
  if (!isRecord(value)) return null
  const id = value.id
  const profilePhoto = value.profilePhoto
  const booksCount = value.booksCount
  const exchangeCount = value.exchangeCount
  if (
    typeof id !== 'number' ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof value.name !== 'string' ||
    typeof value.alias !== 'string' ||
    (profilePhoto !== null && typeof profilePhoto !== 'string') ||
    typeof booksCount !== 'number' ||
    !Number.isSafeInteger(booksCount) ||
    booksCount < 0 ||
    typeof exchangeCount !== 'number' ||
    !Number.isSafeInteger(exchangeCount) ||
    exchangeCount < 0 ||
    typeof value.isFollowing !== 'boolean'
  ) {
    return null
  }
  return {
    id,
    name: value.name,
    alias: value.alias,
    profilePhoto,
    booksCount,
    exchangeCount,
    isFollowing: value.isFollowing,
  }
}

export const fetchPeople = async (
  search: string
): Promise<PersonSearchResult[]> => {
  const response = await apiClient.get<unknown>(
    RELATIVE_API_ROUTES.USER.SEARCH,
    {
      params: { q: search.trim() },
    }
  )
  if (!Array.isArray(response.data)) {
    throw new Error('Invalid person search response')
  }
  const people = response.data.map(normalizePerson)
  if (people.some((person) => person === null)) {
    throw new Error('Invalid person search response')
  }
  return people.filter(
    (person): person is PersonSearchResult => person !== null
  )
}

const normalizeFollowResponse = (value: unknown): PersonFollowResponse => {
  if (
    !isRecord(value) ||
    typeof value.following !== 'boolean' ||
    typeof value.userId !== 'string'
  ) {
    throw new Error('Invalid person follow response')
  }
  return { following: value.following, userId: value.userId }
}

export const setPersonFollowing = async (
  userId: number,
  following: boolean
): Promise<PersonFollowResponse> => {
  const response = following
    ? await apiClient.post<unknown>(
        RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(String(userId))
      )
    : await apiClient.delete<unknown>(
        RELATIVE_API_ROUTES.COMMUNITY.FOLLOW(String(userId))
      )
  return normalizeFollowResponse(response.data)
}
