import axios from 'axios'

const envBaseURL = import.meta.env?.PUBLIC_API_BASE_URL
export const resolvedApiBaseUrl =
  envBaseURL === undefined || envBaseURL === null || envBaseURL === ''
    ? '/api'
    : envBaseURL

export const apiClient = axios.create({
  baseURL: resolvedApiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // API responses depend on the authenticated session. Always revalidate
    // them so a browser cannot reuse another local demo account's data.
    'Cache-Control': 'no-cache',
  },
})
