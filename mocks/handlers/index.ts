import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'
import { contactFormHandler } from './contactForm/contactForm.handler'

export const handlers = [loginHandler, logoutHandler, contactFormHandler]
