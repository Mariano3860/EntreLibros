import { http, HttpResponse } from 'msw'

import { RegisterRequest } from '@src/api/auth/register.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { DEFAULT_EMAIL } from '../../constants/constants'

import errorResponse from './fixtures/register.error.json'
import successResponse from './fixtures/register.success.json'
import { setLoggedInState } from './me.handler'

export const registerHandler = http.post(
  RELATIVE_API_ROUTES.AUTH.REGISTER,
  async ({ request }) => {
    const body = (await request.json()) as RegisterRequest
    const { email } = body

    if (email === DEFAULT_EMAIL) {
      return HttpResponse.json(errorResponse, { status: 409 })
    }

    setLoggedInState(true)
    return HttpResponse.json(successResponse, { status: 201 })
  }
)
