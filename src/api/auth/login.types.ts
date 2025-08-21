/**
 * Tipos para el proceso de inicio de sesión.
 * TODO: considerar soporte para autenticación multifactor.
 */
export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: {
    id: string
    email: string
    role: 'user' | 'admin'
  }
  message: string
}

export type LoginError = {
  error: 'InvalidCredentials' | 'AccountLocked' | 'MissingFields'
  message: string
}
