export type PublicationStatus = 'available' | 'reserved' | 'completed' | 'draft'

export type PublicationCondition =
  | 'new'
  | 'very_good'
  | 'good'
  | 'acceptable'
  | 'unknown'

export type PublicationAvailability = 'public' | 'private'

export type PublicationDelivery = {
  nearBookCorner: boolean
  inPerson: boolean
  shipping: boolean
  shippingPayer: 'owner' | 'requester' | 'split'
}

export type PublicationPrice = {
  amount: number | null
  currency: string
}

export type PublicationImage = {
  id: string
  url: string
  alt: string
  primary?: boolean
}

export type PublicationMetadata = {
  title: string
  author: string
  publisher?: string | null
  year?: string | null
  language?: string | null
}

export type Publication = {
  id: string
  metadata: PublicationMetadata
  condition: PublicationCondition
  status: PublicationStatus
  availability: PublicationAvailability
  notes: string
  delivery: PublicationDelivery
  price: PublicationPrice
  images: PublicationImage[]
  isOwner: boolean
  updatedAt: string
  createdAt: string
}

export type PublicationUpdate = {
  metadata?: Partial<
    Pick<PublicationMetadata, 'title' | 'author' | 'publisher' | 'year'>
  >
  notes?: string
  condition?: PublicationCondition
  status?: PublicationStatus
  availability?: PublicationAvailability
  delivery?: Partial<PublicationDelivery>
  price?: Partial<PublicationPrice>
  images?: PublicationImage[]
}

export type PublicationErrorType =
  | 'not_found'
  | 'forbidden'
  | 'validation'
  | 'network'
  | 'unknown'

export class PublicationApiError extends Error {
  constructor(
    message: string,
    public readonly type: PublicationErrorType,
    public readonly status?: number,
    public readonly details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'PublicationApiError'
  }
}

export const isPublicationApiError = (
  error: unknown
): error is PublicationApiError => error instanceof PublicationApiError
