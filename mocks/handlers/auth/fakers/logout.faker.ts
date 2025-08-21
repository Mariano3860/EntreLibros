import { faker } from '@faker-js/faker'

export const generateLogoutSuccess = () => {
  faker.seed(103)
  return {
    message: 'Successfully logged out',
    timestamp: faker.date.recent().toISOString(),
  }
}
