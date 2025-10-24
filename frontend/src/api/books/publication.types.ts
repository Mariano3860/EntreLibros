/**
 * Status of a publication (book listing)
 */
export type PublicationStatus = 'available' | 'reserved' | 'completed' | 'draft'

/**
 * Full publication details as received from the API
 */
export type Publication = {
  id: string
  title: string
  author: string
  coverUrl: string
  publisher?: string | null
  year?: number | null
  language?: string | null
  format?: string | null
  isbn?: string | null
  condition: 'new' | 'very_good' | 'good' | 'acceptable'
  status: PublicationStatus
  notes?: string | null
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
    tradePreferences: string[]
    availability: 'public' | 'private'
    delivery: {
      nearBookCorner: boolean
      inPerson: boolean
      shipping: boolean
      shippingPayer?: 'owner' | 'requester' | 'split'
    }
  }
  cornerId?: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

/**
 * Payload for updating a publication
 */
export type PublicationUpdate = {
  title?: string
  author?: string
  publisher?: string | null
  year?: number | null
  language?: string | null
  format?: string | null
  isbn?: string | null
  condition?: 'new' | 'very_good' | 'good' | 'acceptable'
  status?: PublicationStatus
  notes?: string | null
  images?: Array<{
    id: string
    url: string
    source: 'cover' | 'upload'
  }>
  offer?: {
    sale?: boolean
    donation?: boolean
    trade?: boolean
    price?: {
      amount: number
      currency: string
    } | null
    tradePreferences?: string[]
    availability?: 'public' | 'private'
    delivery?: {
      nearBookCorner?: boolean
      inPerson?: boolean
      shipping?: boolean
      shippingPayer?: 'owner' | 'requester' | 'split'
    }
  }
  cornerId?: string | null
}
