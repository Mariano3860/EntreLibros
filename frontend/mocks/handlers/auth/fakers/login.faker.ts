import { faker } from '@faker-js/faker'

import { LoginError, LoginResponse } from '@src/api/auth/login.types'

import { DEFAULT_EMAIL } from '../../../constants/constants'

export const generateLoginSuccess = (seed = 101): LoginResponse => {
  faker.seed(seed)
  return {
    user: {
      id: 1,
      email: DEFAULT_EMAIL,
      role: 'user',
      name: 'User',
      language: 'es',
    },
    message: 'auth.success.login',
  }
}

export const generateLoginError = (seed = 102): LoginError => {
  faker.seed(seed)
  return {
    error: 'InvalidCredentials',
    message: 'auth.errors.invalid_credentials',
  }
}
