import axios from 'axios'
import type { TFunction } from 'i18next'

const PUBLIC_ERROR_KEY = /^[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+$/

const ERROR_KEY_ALIASES: Record<string, string> = {
  invalid_credentials: 'auth.errors.invalid_credentials',
  self_conversation: 'messaging.errors.self_conversation',
}

type ErrorRecord = Record<string, unknown>

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === 'object' && value !== null

const asPublicErrorKey = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  if (ERROR_KEY_ALIASES[value]) return ERROR_KEY_ALIASES[value]
  return PUBLIC_ERROR_KEY.test(value) ? value : null
}

export const resolveApiErrorKey = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    const responseKey = isRecord(data) ? asPublicErrorKey(data.message) : null
    if (responseKey) return responseKey
  }

  if (error instanceof Error) {
    const errorKey = asPublicErrorKey(error.message)
    if (errorKey) return errorKey
  }

  return fallback
}

export const translateApiError = (
  t: TFunction,
  error: unknown,
  fallback: string
): string => {
  const key = resolveApiErrorKey(error, fallback)
  const translated = t(key)
  return translated === key ? t(fallback) : translated
}
