import { faker } from '@faker-js/faker'

export const generateMeUser = () => {
  faker.seed(104)
  return {
    id: 'u_1',
    email: 'demo@entrelibros.app',
    roles: ['user'],
  }
}

export const generateUnauthorized = () => ({
  error: 'Unauthorized',
})
