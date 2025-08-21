import type { FeedItem } from './FeedItem.types'

export const filterItems = (items: FeedItem[], type: string) =>
  type === 'all' ? items : items.filter((i) => i.type === type)
