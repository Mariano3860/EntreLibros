import type { ActivityItem } from '@src/api/community/activity.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'

export const generateActivityItems = (seed = 123): ActivityItem[] => {
  void seed
  return prototypeCatalog.stats.contributors.map((person) => ({
    id: `activity-${person.name.toLowerCase()}`,
    user: person.name,
    avatar: '',
  }))
}
