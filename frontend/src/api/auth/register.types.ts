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
    id: string
    email: string
    role: 'user' | 'admin'
    name?: string
  }
  message: string
}

export type RegisterError = {
  error: 'EmailExists' | 'MissingFields'
  message: string
}
