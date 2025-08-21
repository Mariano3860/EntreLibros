import { faker } from '@faker-js/faker'

export const generateMeUser = (seed = 104) => {
  faker.seed(seed)
  return {
    id: 'u_1',
    email: 'demo@entrelibros.app',
    roles: ['user'],
  }
}

export const generateUnauthorized = () => ({
  error: 'Unauthorized',
})
