import { RELATIVE_API_ROUTES } from '@api/routes'
import { http, HttpResponse } from 'msw'

import successUser from './fixtures/me.success.json'
import unauthorizedBody from './fixtures/me.unauthorized.json'

type Override = 'auto' | 'logged-in' | 'logged-out'

// Build-time override via .env (optional). Example: VITE_MSW_FORCE_AUTH=logged-in
let AUTH_OVERRIDE: Override =
  (import.meta.env.PUBLIC_MSW_FORCE_AUTH as Override) ?? 'auto'

function getCookie(name: string, cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';').map((c) => c.trim())
  const found = parts.find((c) => c.startsWith(`${name}=`))
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null
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
 *  2) Otherwise, presence of "authToken" cookie (set by /auth/login handler)
 */
export const meHandler = http.get(
  RELATIVE_API_ROUTES.AUTH.ME,
  ({ request }) => {
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

    // 2) Cookie-based default
    const cookieHeader = request.headers.get('cookie')
    const token = getCookie('authToken', cookieHeader)
    if (token) {
      return HttpResponse.json(successUser, { status: 200 })
    }
    return HttpResponse.json(unauthorizedBody, {
      status: 401,
      statusText: 'Unauthorized',
    })
  }
)
