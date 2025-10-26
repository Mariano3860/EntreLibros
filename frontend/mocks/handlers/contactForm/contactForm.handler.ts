import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

const errorResponse = {
  message:
    'Ocurrió un error al enviar tu mensaje. Por favor intenta nuevamente más tarde.',
}

export const contactFormHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.CONTACT_FORM.SUBMIT),
  async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      email: string
      message: string
    }
    const { name, email, message } = body

    // Errores explícitos según contenido del mensaje
    if (name.includes('400')) {
      return HttpResponse.json(
        { ...errorResponse, message: 'Bad Request triggered manually' },
        { status: 400, statusText: 'Bad Request' }
      )
    }

    if (name.includes('500')) {
      return HttpResponse.json(
        { ...errorResponse, message: 'Internal Error triggered manually' },
        { status: 500, statusText: 'Internal Server Error' }
      )
    }

    // Simular pequeño retardo de red
    await new Promise((r) => setTimeout(r, 200))

    const timestamp = new Date().toISOString()

    return HttpResponse.json(
      {
        message: 'contact.success.submitted',
        contact: {
          id: 1,
          name,
          email,
          message,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      {
        status: 201,
      }
    )
  }
)
