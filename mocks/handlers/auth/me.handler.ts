import { RELATIVE_API_ROUTES } from '@api/routes'
import { http, HttpResponse } from 'msw'

import {
  generateMeUser,
  generateUnauthorized,
} from './fakers/me.faker'

const successUser = generateMeUser()
const unauthorizedBody = generateUnauthorized()

type Override = 'auto' | 'logged-in' | 'logged-out'

// Build-time override via .env (optional). Example: VITE_MSW_FORCE_AUTH=logged-in
let AUTH_OVERRIDE: Override =
  (import.meta.env.PUBLIC_MSW_FORCE_AUTH as Override) ?? 'auto'
let IS_LOGGED_IN = false

export const setLoggedInState = (next: boolean) => {
  IS_LOGGED_IN = next
}

/**
 * Runtime toggle (no app code changes needed).
 * Usage from browser console:
 *   await fetch('/_msw/auth/state?set=logged-in')
 *   await fetch('/_msw/auth/state?set=logged-out')
 *   await fetch('/_msw/auth/state?set=auto')  // back to cookie-based
 */
export const authStateHandler = http.get('/_msw/auth/state', ({ request }) => {
  const url = new URL(request.url)
  const next = url.searchParams.get('set') as Override | null
  if (next && ['auto', 'logged-in', 'logged-out'].includes(next)) {
    AUTH_OVERRIDE = next
  }
  return HttpResponse.json({ override: AUTH_OVERRIDE }, { status: 200 })
})

/**
 * /auth/me — returns 200 with user or 401 based on:
 *  1) AUTH_OVERRIDE if not "auto"
 *  2) Otherwise, presence of "sessionToken" cookie (set by /auth/login handler)
 */
export const meHandler = http.get(
  RELATIVE_API_ROUTES.AUTH.ME,
  ({ cookies }) => {
    // 1) Override wins
    if (AUTH_OVERRIDE === 'logged-in') {
      return HttpResponse.json(successUser, { status: 200 })
    }
    if (AUTH_OVERRIDE === 'logged-out') {
      return HttpResponse.json(unauthorizedBody, {
        status: 401,
        statusText: 'Unauthorized',
      })
    }

    // 2) Session-based flag
    if (IS_LOGGED_IN) {
      return HttpResponse.json(successUser, { status: 200 })
    }

    // 3) Cookie-based default
    const token = cookies.sessionToken
    if (token) {
      return HttpResponse.json(successUser, { status: 200 })
    }
    return HttpResponse.json(unauthorizedBody, {
      status: 401,
      statusText: 'Unauthorized',
    })
  }
)
