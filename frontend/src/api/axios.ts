import axios from 'axios'

const envBaseURL = import.meta.env.PUBLIC_API_BASE_URL
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
  },
})
