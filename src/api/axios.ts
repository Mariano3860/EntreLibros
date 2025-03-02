import axios from 'axios'

const baseURL =
  process.env.API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.buggies.com' : '/api')

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
