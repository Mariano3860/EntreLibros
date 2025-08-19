export interface BookCardProps {
  title: string
  author: string
  coverUrl: string
  condition?: string
  status?: 'available' | 'reserved' | 'sold' | 'exchanged'
  isForSale?: boolean
  price?: number | null
  isForTrade?: boolean
  tradePreferences?: string[]
  isSeeking?: boolean
}
