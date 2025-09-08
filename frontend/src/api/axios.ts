import axios from 'axios'

const baseURL = import.meta.env.PUBLIC_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
