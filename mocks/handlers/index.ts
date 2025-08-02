import { loginHandler } from './auth/login.handler'
import { logoutHandler } from './auth/logout.handler'

export const handlers = [loginHandler, logoutHandler]
