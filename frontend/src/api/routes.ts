import { resolveBooksPath } from './books/config'

export const RELATIVE_API_ROUTES = {
  AUTH: {
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    PROFILE: `/auth/profile`,
    ME: `/auth/me`,
    REGISTER: `/auth/register`,
  },
  CONTACT_FORM: {
    SUBMIT: `/contact/submit`,
  },
  BOOKS: {
    LIST: resolveBooksPath('/books'),
    MINE: resolveBooksPath('/books/mine'),
    SEARCH: resolveBooksPath('/books/search'),
    PUBLISH: resolveBooksPath('/books'),
    DETAIL: (id: string) => resolveBooksPath(`/books/${id}`),
  },
  COMMUNITY: {
    STATS: `/community/stats`,
    FEED: `/community/feed`,
    ACTIVITY: `/community/activity`,
    SUGGESTIONS: `/community/suggestions`,
    CORNERS: {
      NEARBY: `/community/corners/nearby`,
      MAP: `/community/corners/map`,
      CREATE: `/community/corners`,
    },
  },
  LANGUAGE: {
    UPDATE: `/user/language`,
  },
  MAP: {
    ROOT: `/map`,
    GEOCODE: `/map/geocode`,
  },
}
