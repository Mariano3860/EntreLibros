import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'
import { authStateHandler, meHandler } from './auth/me.handler'
import { booksHandler } from './books/books.handler'
import { contactFormHandler } from './contactForm/contactForm.handler'

export const handlers = [
  loginHandler,
  logoutHandler,
  authStateHandler,
  meHandler,
  booksHandler,
  contactFormHandler,
]
