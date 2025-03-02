export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'user' | 'admin'
    name?: string
    lastLogin?: string
  }
  expiresIn: number
  message: string
}

export interface LoginError {
  error: 'InvalidCredentials' | 'AccountLocked' | 'MissingFields'
  message: string
  remainingAttempts?: number
}
