import {
  initialMetadata,
  initialOffer,
  initialState,
} from './PublishBookModal.constants'
import {
  PublishBookDraftState,
  PublishBookFormState,
  PublishBookImage,
} from './PublishBookModal.types'

export const sanitizeDraft = (
  draft: PublishBookDraftState | null
): PublishBookFormState => {
  if (!draft) return initialState
  return {
    ...initialState,
    ...draft,
    metadata: { ...initialMetadata, ...draft.metadata },
    offer: { ...initialOffer, ...draft.offer },
    corner: draft.corner ?? null,
  }
}

export const ensureCover = (
  images: PublishBookImage[],
  coverUrl?: string
): PublishBookImage[] => {
  if (coverUrl && !images.some((image) => image.source === 'cover')) {
    return [
      {
        id: `cover-${Date.now()}`,
        url: coverUrl,
        source: 'cover',
      },
      ...images,
    ]
  }
  return images
}

export const getPreviewCover = (
  images: PublishBookImage[],
  fallback?: string
): string => {
  if (images.length === 0) return fallback ?? ''
  const cover = images.find((image) => image.source === 'cover')
  return (cover ?? images[0]).url
}
