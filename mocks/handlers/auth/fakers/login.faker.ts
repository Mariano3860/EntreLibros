import { faker } from '@faker-js/faker'

import { LoginError, LoginResponse } from '@src/api/auth/login.types'

export const generateLoginSuccess = (): LoginResponse => {
  faker.seed(101)
  return {
    token: faker.internet.jwt(),
    expiresIn: faker.number.int({ min: 3600, max: 7200 }),
    user: {
      id: '1',
      email: 'user@entrelibros.com',
      role: 'user',
      name: faker.person.fullName(),
      lastLogin: faker.date.recent().toISOString(),
    },
    message: 'auth.success.login',
  }
}

export const generateLoginError = (): LoginError => {
  faker.seed(102)
  return {
    error: 'InvalidCredentials',
    message: 'auth.errors.invalid_credentials',
    remainingAttempts: faker.number.int({ min: 0, max: 3 }),
  }
}
