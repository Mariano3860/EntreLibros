import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

let currentLanguage = 'es'

export const userLanguageHandler = http.post(
  apiRouteMatcher(RELATIVE_API_ROUTES.LANGUAGE.UPDATE),
  async ({ request }) => {
    const body = (await request.json()) as { language: string }
    currentLanguage = body.language
    return HttpResponse.json({ language: currentLanguage }, { status: 200 })
  }
)
