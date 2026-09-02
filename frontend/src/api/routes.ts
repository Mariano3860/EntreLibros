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
    ACTIVITY: `/user/activity`,
  },
  CONTACT_FORM: {
    SUBMIT: `/contact/submit`,
  },
  BOOKS: {
    LIST: `/books`,
    HOME: `/books/home`,
    MINE: `/books/mine`,
    SEARCH: `/books/search`,
    PUBLISH: `/books`,
    INTEREST: (id: string) => `/books/${id}/interest`,
    WANT: (id: string) => `/books/${id}/want`,
  },
  COMMUNITY: {
    STATS: `/community/stats`,
    FEED: `/community/feed`,
    ACTIVITY: `/community/activity`,
    SUGGESTIONS: `/community/suggestions`,
    DISCOVERY: `/community/discovery`,
    FOLLOW: (id: string) => `/community/follows/${id}`,
    STORIES: `/community/stories`,
    POST_LIKE: (postType: string, id: string) =>
      `/community/posts/${postType}/${id}/like`,
    POST_COMMENTS: (postType: string, id: string) =>
      `/community/posts/${postType}/${id}/comments`,
    MESSAGES: {
      AVAILABILITY: `/community/messages/availability`,
    },
    CORNERS: {
      NEARBY: `/community/corners/nearby`,
      MAP: `/community/corners/map`,
      CREATE: `/community/corners`,
      DETAIL: (cornerId: string) => `/community/corners/${cornerId}`,
      UPDATE: (cornerId: string) => `/community/corners/${cornerId}`,
    },
  },
  MESSAGES: {
    CONVERSATIONS: `/messages`,
    CONTACTS: `/messages/contacts`,
    CREATE_CONVERSATION: `/messages/conversations`,
    BOOKS: (conversationId: number) => `/messages/${conversationId}/books`,
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
