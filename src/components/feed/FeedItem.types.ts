export type FeedItem =
  | BookItem
  | SwapProposalItem
  | SaleItem
  | SeekingItem
  | ReviewItem
  | EventItem
  | HouseItem
  | PersonItem

export type BookItem = {
  type: 'book'
  id: string
  title: string
  author: string
  cover: string
}

export type SwapProposalItem = {
  type: 'swap'
  id: string
  requester: string
  offered: string
  requested: string
}

export type SaleItem = {
  type: 'sale'
  id: string
  title: string
  price: number
  condition: string
}

export type SeekingItem = {
  type: 'seeking'
  id: string
  user: string
  title: string
}

export type ReviewItem = {
  type: 'review'
  id: string
  user: string
  book: string
  quote: string
  rating?: number
}

export type EventItem = {
  type: 'event'
  id: string
  title: string
  date: string
  location: string
  going?: boolean
}

export type HouseItem = {
  type: 'house'
  id: string
  name: string
  distance: number
}

export type PersonItem = {
  type: 'person'
  id: string
  name: string
  match: number
  lastActivity: string
}
