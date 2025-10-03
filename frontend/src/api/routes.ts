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
    LIST: `/books`,
    MINE: `/books/mine`,
    SEARCH: `/books/search`,
    PUBLISH: `/books`,
  },
  COMMUNITY: {
    STATS: `/community/stats`,
    FEED: `/community/feed`,
    ACTIVITY: `/community/activity`,
    SUGGESTIONS: `/community/suggestions`,
    CORNERS: {
      NEARBY: `/community/corners/nearby`,
      MAP: `/community/corners/map`,
    },
  },
  LANGUAGE: {
    UPDATE: `/user/language`,
  },
  MAP: {
    ROOT: `/map`,
  },
}
