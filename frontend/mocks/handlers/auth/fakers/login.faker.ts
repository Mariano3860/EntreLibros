import { faker } from '@faker-js/faker'

import { LoginError, LoginResponse } from '@src/api/auth/login.types'

export const generateLoginSuccess = (seed = 101): LoginResponse => {
  faker.seed(seed)
  return {
    token: faker.internet.jwt(),
    user: {
      id: 1,
      email: 'user@entrelibros.com',
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
