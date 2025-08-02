import { http, HttpResponse } from 'msw'

import { LoginRequest } from '@/api/auth/login.types'
import { RELATIVE_API_ROUTES } from '@/api/routes'

import { DEFAULT_EMAIL, DEFAULT_PASS } from '../../constants/constants'

import errorResponse from './fixtures/login.error.json'
import successResponse from './fixtures/login.success.json'



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

    return HttpResponse.json(successResponse, {
      status: 200,
      headers: {
        'Set-Cookie': `authToken=${successResponse.token}; HttpOnly; Secure`,
        'Content-Type': 'application/json',
      },
    })
  }
)
