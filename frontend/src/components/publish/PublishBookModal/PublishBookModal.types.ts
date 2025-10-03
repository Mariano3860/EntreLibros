export type PublishBookStep = 'identify' | 'offer' | 'review'

export type PublishBookMetadata = {
  title: string
  author: string
  publisher: string
  year: string
  language: string
  format: string
  isbn: string
  coverUrl?: string
}

export type PublishBookImage = {
  id: string
  url: string
  source: 'cover' | 'upload'
  name?: string
}

export type PublishBookCorner = {
  id: string
  name: string
}

export type PublishBookOffer = {
  sale: boolean
  donation: boolean
  trade: boolean
  priceAmount: string
  priceCurrency: string
  condition: 'new' | 'very_good' | 'good' | 'acceptable' | ''
  tradePreferences: string[]
  notes: string
  availability: 'public' | 'private'
  delivery: {
    nearBookCorner: boolean
    inPerson: boolean
    shipping: boolean
    shippingPayer: 'owner' | 'requester' | 'split'
  }
}

export type PublishBookFormState = {
  metadata: PublishBookMetadata
  offer: PublishBookOffer
  images: PublishBookImage[]
  manualMode: boolean
  searchQuery: string
  step: PublishBookStep
  acceptedTerms: boolean
  corner: PublishBookCorner | null
}

export type PublishBookDraftState = PublishBookFormState
