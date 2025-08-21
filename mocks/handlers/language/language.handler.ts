import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

let currentLanguage = 'es'

export const userLanguageHandler = http.post(
  RELATIVE_API_ROUTES.LANGUAGE.UPDATE,
  async ({ request }) => {
    const body = (await request.json()) as { language: string }
    currentLanguage = body.language
    return HttpResponse.json({ language: currentLanguage }, { status: 200 })
  }
)
