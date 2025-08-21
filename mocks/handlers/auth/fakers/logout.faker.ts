import { faker } from '@faker-js/faker'

export const generateLogoutSuccess = (seed = 103) => {
  faker.seed(seed)
  return {
    message: 'Successfully logged out',
    timestamp: faker.date.recent().toISOString(),
  }
}
