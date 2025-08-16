import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@/api/routes'

import successResponse from './fixtures/logout.success.json'
import { setLoggedInState } from './me.handler'

export const logoutHandler = http.post(RELATIVE_API_ROUTES.AUTH.LOGOUT, () => {
  setLoggedInState(false)
  return HttpResponse.json(successResponse, {
    status: 200,
    headers: {
      'Set-Cookie':
        'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure',
      'Content-Type': 'application/json',
    },
  })
})
