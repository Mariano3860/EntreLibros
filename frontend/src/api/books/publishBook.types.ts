import { ApiUserBook } from './userBooks.types'

export type PublishBookPayload = {
  metadata: {
    title: string
    author: string
    publisher?: string
    year?: number | null
    language?: string
    format?: string
    isbn?: string
    coverUrl?: string
  }
  images: Array<{
    id: string
    url: string
    source: 'cover' | 'upload'
  }>
  offer: {
    sale: boolean
    donation: boolean
    trade: boolean
    price?: {
      amount: number
      currency: string
    } | null
    condition: 'new' | 'very_good' | 'good' | 'acceptable'
    tradePreferences: string[]
    notes?: string
    availability: 'public' | 'private'
    delivery: {
      nearBookCorner: boolean
      inPerson: boolean
      shipping: boolean
      shippingPayer?: 'owner' | 'requester' | 'split'
    }
  }
  cornerId?: string | null
  draft?: boolean
}

export type PublishBookResponse = ApiUserBook & {
  publisher?: string
  year?: number
  language?: string
  format?: string
  isbn?: string
  availability?: 'public' | 'private'
  delivery?: PublishBookPayload['offer']['delivery']
  cornerId?: string | null
}
