import { loginHandler } from './auth'
import { logoutHandler } from './auth/logout.handler'

export const handlers = [loginHandler, logoutHandler]
