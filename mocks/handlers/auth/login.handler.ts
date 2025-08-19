import { http, HttpResponse } from 'msw'

import { LoginRequest } from '@src/api/auth/login.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { DEFAULT_EMAIL, DEFAULT_PASS } from '../../constants/constants'

import errorResponse from './fixtures/login.error.json'
import successResponse from './fixtures/login.success.json'
import { setLoggedInState } from './me.handler'

export const loginHandler = http.post(
  RELATIVE_API_ROUTES.AUTH.LOGIN,
  async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const { email, password } = body

    const isValidCredentials =
      email === DEFAULT_EMAIL && password === DEFAULT_PASS

    if (!isValidCredentials) {
      return HttpResponse.json(errorResponse, {
        status: 401,
        statusText: 'Unauthorized',
      })
    }

    setLoggedInState(true)
    return HttpResponse.json(successResponse, {
      status: 200,
      // HttpOnly should be set in the server, but won't be used in development
      headers: {
        // Secure flag omitted so that the cookie is sent over HTTP in development
        'Set-Cookie': `sessionToken=${successResponse.token}; Path=/; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    })
  }
)
