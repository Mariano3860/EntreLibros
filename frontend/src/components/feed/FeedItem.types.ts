export type FeedItem =
  | BookItem
  | SwapProposalItem
  | SaleItem
  | SeekingItem
  | ReviewItem
  | EventItem
  | HouseItem
  | PersonItem
  | StoryItem

export type FeedBase = {
  id: string
  user: string
  avatar: string
  time: string
  likes: number
  corner?: FeedCorner
}

export type FeedCorner = {
  id: string
  name: string
}

export type BookItem = FeedBase & {
  type: 'book'
  title: string
  author: string
  cover: string
}

export type SwapParticipant = {
  id: string
  displayName: string
  username: string
  avatar: string
}

export type SwapListing = {
  id: string
  title: string
  author?: string
  cover?: string
  category: 'book' | 'sale' | 'seeking'
  owner: SwapParticipant
}

export type SwapProposalItem = FeedBase & {
  type: 'swap'
  requester: SwapParticipant
  offered: SwapListing
  requested: SwapListing
}

export type SaleItem = FeedBase & {
  type: 'sale'
  title: string
  price: number
  condition: string
  cover: string
}

export type SeekingItem = FeedBase & {
  type: 'seeking'
  title: string
}

export type ReviewItem = FeedBase & {
  type: 'review'
  book: string
  quote: string
  rating?: number
}

export type EventItem = FeedBase & {
  type: 'event'
  title: string
  date: string
  location: string
  going?: boolean
}

export type HouseItem = FeedBase & {
  type: 'house'
  name: string
  distance: number
}

export type PersonItem = FeedBase & {
  type: 'person'
  name: string
  match: number
  lastActivity: string
}

export type StoryItem = FeedBase & {
  type: 'story'
  title: string
  body: string
  image?: string
  book?: { id: string; title: string; author: string; cover: string }
}
