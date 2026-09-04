export type ApiUserBook = {
  id: string
  title: string
  author: string
  coverUrl: string
  condition?: string
  status?: 'available' | 'reserved' | 'sold' | 'exchanged'
  bookListingStatus?: string
  type?: 'offer' | 'want'
  isForSale?: boolean
  price?: number | null
  priceCurrency?: string | null
  isForTrade?: boolean
  isForDonation?: boolean
  tradePreferences?: string[]
  isSeeking?: boolean
  availability?: 'public' | 'private'
  notes?: string
  publisher?: string
  year?: number
  language?: string
  format?: string
  isbn?: string
  draft?: boolean
  isInterested?: boolean
  ownerId?: string
  ownerName?: string | null
}
