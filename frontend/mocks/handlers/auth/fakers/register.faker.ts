import { faker } from '@faker-js/faker'

import { RegisterError, RegisterResponse } from '@src/api/auth/register.types'

export const generateRegisterSuccess = (seed = 105): RegisterResponse => {
  faker.seed(seed)
  return {
    user: {
      id: 2,
      email: 'new@entrelibros.com',
      role: 'user',
      name: 'New User',
      language: 'es',
    },
    message: 'auth.success.register',
  }
}

export const generateRegisterError = (seed = 106): RegisterError => {
  faker.seed(seed)
  return {
    error: 'EmailExists',
    message: 'auth.errors.email_exists',
  }
}
