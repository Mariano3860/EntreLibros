import { http, HttpResponse } from 'msw'
import successResponse from './fixtures/login.success.json'
import errorResponse from './fixtures/login.error.json'
import { LoginRequest } from '@/api/auth/login.types'
import { API_ROUTES } from '@/api/routes'

export const loginHandler = http.post<LoginRequest, '/api/auth/login'>(
  API_ROUTES.AUTH.LOGIN,
  async ({ request }) => {
    const { email, password } =
      (await request.json()) as unknown as LoginRequest

    const isValidCredentials = email === 'user@entrelibros.com' && password === '' // Contraseña corregida

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
      },
    })
  }
)
