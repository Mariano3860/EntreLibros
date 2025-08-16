import axios from 'axios'

const baseURL = import.meta.env.PUBLIC_API_BASE_URL || ''

const token =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
})

export const setAuthToken = (token?: string) => {
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('token', token)
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete apiClient.defaults.headers.common.Authorization
  }
}
