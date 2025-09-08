import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'
import { authStateHandler, meHandler } from './auth/me.handler'
import { registerHandler } from './auth/register.handler'
import { booksHandler } from './books/books.handler'
import { userBooksHandler } from './books/userBooks.handler'
import { activityHandler } from './community/activity.handler'
import { communityStatsHandler } from './community/communityStats.handler'
import { communityFeedHandler } from './community/feed.handler'
import { suggestionsHandler } from './community/suggestions.handler'
import { contactFormHandler } from './contactForm/contactForm.handler'
import { userLanguageHandler } from './language/language.handler'

export const handlers = [
  loginHandler,
  registerHandler,
  logoutHandler,
  authStateHandler,
  meHandler,
  booksHandler,
  userBooksHandler,
  contactFormHandler,
  userLanguageHandler,
  communityStatsHandler,
  communityFeedHandler,
  activityHandler,
  suggestionsHandler,
]
