import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'
import { authStateHandler, meHandler } from './auth/me.handler'
import { registerHandler } from './auth/register.handler'
import {
  bookDetailHandler,
  updateBookHandler,
} from './books/bookDetail.handler'
import { booksHandler } from './books/books.handler'
import { publishBookHandler } from './books/publish.handler'
import { searchBooksHandler } from './books/search.handler'
import { userBooksHandler } from './books/userBooks.handler'
import { activityHandler } from './community/activity.handler'
import { communityStatsHandler } from './community/communityStats.handler'
import { communityFeedHandler } from './community/feed.handler'
import {
  cornersMapHandler,
  createCornerSuccessHandler,
  nearbyCornersHandler,
} from './community/corners.handler'
import { suggestionsHandler } from './community/suggestions.handler'
import { contactFormHandler } from './contactForm/contactForm.handler'
import { userLanguageHandler } from './language/language.handler'
import { geocodingHandler } from './map/geocoding.handler'
import { mapHandler } from './map/map.handler'

export const handlers = [
  loginHandler,
  registerHandler,
  logoutHandler,
  authStateHandler,
  meHandler,
  booksHandler,
  bookDetailHandler,
  updateBookHandler,
  searchBooksHandler,
  publishBookHandler,
  userBooksHandler,
  contactFormHandler,
  userLanguageHandler,
  communityStatsHandler,
  communityFeedHandler,
  nearbyCornersHandler,
  cornersMapHandler,
  createCornerSuccessHandler,
  activityHandler,
  suggestionsHandler,
  geocodingHandler,
  mapHandler,
]
