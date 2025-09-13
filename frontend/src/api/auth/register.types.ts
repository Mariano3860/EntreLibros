/**
 * Types for user registration.
 */
export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type RegisterResponse = {
  token: string
  user: {
    id: number
    email: string
    role: 'user' | 'admin'
    name?: string
    language: string
  }
  message: string
}

export type RegisterError = {
  error: 'EmailExists' | 'MissingFields'
  message: string
}
