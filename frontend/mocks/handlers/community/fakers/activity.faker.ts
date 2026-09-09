import type { ActivityItem } from '@src/api/community/activity.types'
import { mockExperienceFixtures } from '@src/mocks/fixtures/experience'

export const generateActivityItems = (seed = 123): ActivityItem[] => {
  void seed
  return mockExperienceFixtures.stats.contributors.map((person) => ({
    id: `activity-${person.name.toLowerCase()}`,
    user: person.name,
    avatar: '',
  }))
}
