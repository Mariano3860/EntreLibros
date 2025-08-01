import { http, HttpResponse } from 'msw'
import successResponse from './fixtures/logout.success.json'
import { RELATIVE_API_ROUTES } from '@/api/routes'

export const logoutHandler = http.post(RELATIVE_API_ROUTES.AUTH.LOGOUT, () => {
  return HttpResponse.json(successResponse, {
    status: 200,
    headers: {
      'Set-Cookie':
        'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure',
      'Content-Type': 'application/json',
    },
  })
})
