import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

import { RegisterRequest } from '@src/api/auth/register.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

import { DEFAULT_EMAIL } from '../../constants/constants'

import {
  generateRegisterError,
  generateRegisterSuccess,
} from './fakers/register.faker'
import { setLoggedInState } from './me.handler'

export const registerHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.AUTH.REGISTER),
  async ({ request }) => {
    const body = (await request.json()) as RegisterRequest
    const { email } = body

    if (email === DEFAULT_EMAIL) {
      const errorResponse = generateRegisterError()
      return HttpResponse.json(errorResponse, { status: 409 })
    }

    setLoggedInState(true)
    const successResponse = generateRegisterSuccess()
    const token = faker.internet.jwt()
    return HttpResponse.json(successResponse, {
      status: 201,
      headers: {
        'Set-Cookie': `sessionToken=${token}; Path=/; SameSite=Strict`,
      },
    })
  }
)
