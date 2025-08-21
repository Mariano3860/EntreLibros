import { faker } from '@faker-js/faker'

import { RegisterError, RegisterResponse } from '@src/api/auth/register.types'

export const generateRegisterSuccess = (): RegisterResponse => {
  faker.seed(105)
  return {
    token: faker.internet.jwt(),
    user: {
      id: '2',
      email: 'new@entrelibros.com',
      role: 'user',
      name: faker.person.firstName(),
    },
    message: 'auth.success.register',
  }
}

export const generateRegisterError = (): RegisterError => ({
  error: 'EmailExists',
  message: 'auth.errors.email_exists',
})
