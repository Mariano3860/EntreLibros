export const RELATIVE_API_ROUTES = {
  AUTH: {
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    PROFILE: `/auth/profile`,
    ME: `/auth/me`,
    REGISTER: `/auth/register`,
  },
  USER: {
    PROFILE: `/user/profile`,
    PUBLIC_PROFILE: (id: number) => `/user/profile/${id}`,
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
    MESSAGES: {
      AVAILABILITY: `/community/messages/availability`,
    },
    CORNERS: {
      NEARBY: `/community/corners/nearby`,
      MAP: `/community/corners/map`,
      CREATE: `/community/corners`,
    },
  },
  MESSAGES: {
    CONVERSATIONS: `/messages`,
    CREATE_CONVERSATION: `/messages/conversations`,
    HISTORY: (conversationId: number) => `/messages/${conversationId}/messages`,
    READ: (conversationId: number) => `/messages/${conversationId}/read`,
  },
  AGREEMENTS: {
    GET: (agreementId: number) => `/agreements/${agreementId}`,
    HISTORY: (agreementId: number) => `/agreements/${agreementId}/history`,
    CREATE: `/agreements`,
    VERSION: (agreementId: number) => `/agreements/${agreementId}/versions`,
    COMMAND: (agreementId: number) => `/agreements/${agreementId}/commands`,
  },
  NOTIFICATIONS: {
    LIST: `/notifications`,
    READ: (id: number) => `/notifications/${id}/read`,
    PREFERENCES: `/notifications/preferences`,
  },
  LANGUAGE: {
    UPDATE: `/user/language`,
  },
  MAP: {
    ROOT: `/map`,
    GEOCODE: `/map/geocode`,
  },
}
