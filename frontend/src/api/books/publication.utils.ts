import type { Publication, PublicationUpdate } from './publication.types'

export const applyPublicationUpdate = (
  publication: Publication,
  input: PublicationUpdate
): Publication => {
  const price = input.price
    ? { ...publication.price, ...input.price }
    : publication.price

  return {
    ...publication,
    metadata: input.metadata
      ? { ...publication.metadata, ...input.metadata }
      : publication.metadata,
    notes: input.notes ?? publication.notes,
    condition: input.condition ?? publication.condition,
    status: input.status ?? publication.status,
    availability: input.availability ?? publication.availability,
    delivery: input.delivery
      ? { ...publication.delivery, ...input.delivery }
      : publication.delivery,
    price: {
      amount: price.amount ?? null,
      currency: price.currency,
    },
    images: input.images ?? publication.images,
    updatedAt: new Date().toISOString(),
  }
}
