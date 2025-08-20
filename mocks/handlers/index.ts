import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'
import { authStateHandler, meHandler } from './auth/me.handler'
import { registerHandler } from './auth/register.handler'
import { booksHandler } from './books/books.handler'
import { contactFormHandler } from './contactForm/contactForm.handler'
import { communityStatsHandler } from './community/communityStats.handler'

export const handlers = [
  loginHandler,
  registerHandler,
  logoutHandler,
  authStateHandler,
  meHandler,
  booksHandler,
  contactFormHandler,
  communityStatsHandler,
]
