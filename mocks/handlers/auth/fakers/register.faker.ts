import { faker } from '@faker-js/faker'

import { RegisterError, RegisterResponse } from '@src/api/auth/register.types'

export const generateRegisterSuccess = (seed = 105): RegisterResponse => {
  faker.locale = faker.helpers.arrayElement(['es', 'en', 'fr'])
  faker.seed(seed)
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

export const generateRegisterError = (seed = 106): RegisterError => ({
  error: 'EmailExists',
  message: 'auth.errors.email_exists',
})
