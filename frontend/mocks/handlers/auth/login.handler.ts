import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

import { LoginRequest } from '@src/api/auth/login.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

import { DEFAULT_EMAIL, DEFAULT_PASS } from '../../constants/constants'

import { generateLoginError, generateLoginSuccess } from './fakers/login.faker'
import { setLoggedInState } from './me.handler'

export const loginHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.AUTH.LOGIN),
  async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const { email, password } = body

    const isValidCredentials =
      email === DEFAULT_EMAIL && password === DEFAULT_PASS

    if (!isValidCredentials) {
      const errorResponse = generateLoginError()
      return HttpResponse.json(errorResponse, {
        status: 401,
        statusText: 'Unauthorized',
      })
    }

    setLoggedInState(true)
    const successResponse = generateLoginSuccess()
    const token = faker.internet.jwt()
    return HttpResponse.json(successResponse, {
      status: 200,
      // HttpOnly should be set in the server, but won't be used in development
      headers: {
        // Secure flag omitted so that the cookie is sent over HTTP in development
        'Set-Cookie': `sessionToken=${token}; Path=/; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    })
  }
)
