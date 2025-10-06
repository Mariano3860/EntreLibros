import {
  PublishBookDraftState,
  PublishBookFormState,
  PublishBookMetadata,
  PublishBookOffer,
  PublishBookStep,
} from './PublishBookModal.types'

export const STORAGE_KEY = 'entrelibros.publish.draft'

export const initialMetadata: PublishBookMetadata = {
  title: '',
  author: '',
  publisher: '',
  year: '',
  language: '',
  format: '',
  isbn: '',
  coverUrl: '',
}

export const initialOffer: PublishBookOffer = {
  sale: false,
  donation: false,
  trade: false,
  priceAmount: '',
  priceCurrency: 'ARS',
  condition: '',
  tradePreferences: [],
  notes: '',
  availability: 'public',
  delivery: {
    nearBookCorner: true,
    inPerson: true,
    shipping: false,
    shippingPayer: 'owner',
  },
}

export const initialState: PublishBookFormState = {
  metadata: initialMetadata,
  offer: initialOffer,
  images: [],
  manualMode: false,
  searchQuery: '',
  step: 'identify',
  acceptedTerms: false,
  corner: null,
}

export const genres = [
  'fiction',
  'nonfiction',
  'fantasy',
  'history',
  'science',
  'romance',
  'selfHelp',
] as const

export const stepOrder: PublishBookStep[] = ['identify', 'offer', 'review']

export const toSerializableDraft = (
  state: PublishBookFormState
): PublishBookDraftState => ({
  ...state,
  images: state.images.map(({ id, url, source, name }) => ({
    id,
    url,
    source,
    name,
  })),
})
