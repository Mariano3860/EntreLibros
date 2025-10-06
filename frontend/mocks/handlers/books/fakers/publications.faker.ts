import { faker } from '@faker-js/faker'

import { applyPublicationUpdate } from '@src/api/books/publication.utils'
import type {
  Publication,
  PublicationImage,
  PublicationStatus,
  PublicationUpdate,
} from '@src/api/books/publication.types'

const publications = new Map<string, Publication>()

const defaultImages = (coverUrl: string): PublicationImage[] => [
  {
    id: faker.string.uuid(),
    url: coverUrl,
    alt: 'Cover',
    primary: true,
  },
  {
    id: faker.string.uuid(),
    url: `${coverUrl}&variant=1`,
    alt: 'Back cover',
  },
]

const buildPublication = (
  id: string,
  overrides?: Partial<Publication>
): Publication => {
  const title = overrides?.metadata?.title ?? faker.lorem.words(3)
  const author = overrides?.metadata?.author ?? faker.person.fullName()
  const cover =
    overrides?.images?.[0]?.url ??
    `https://placehold.co/400x600?text=${encodeURIComponent(title)}`

  return {
    id,
    metadata: {
      title,
      author,
      publisher: overrides?.metadata?.publisher ?? faker.company.name(),
      year:
        overrides?.metadata?.year ??
        String(faker.date.past({ years: 20 }).getFullYear()),
      language: overrides?.metadata?.language ?? 'es',
    },
    condition: overrides?.condition ?? 'good',
    status: overrides?.status ?? 'available',
    availability: overrides?.availability ?? 'public',
    notes: overrides?.notes ?? faker.lorem.sentences({ min: 1, max: 2 }),
    delivery: overrides?.delivery ?? {
      inPerson: true,
      nearBookCorner: faker.datatype.boolean(),
      shipping: faker.datatype.boolean(),
      shippingPayer: 'split',
    },
    price: overrides?.price ?? {
      amount: faker.number.int({ min: 5000, max: 25000 }),
      currency: 'ARS',
    },
    images: overrides?.images ?? defaultImages(cover),
    isOwner: overrides?.isOwner ?? false,
    createdAt:
      overrides?.createdAt ?? faker.date.past({ years: 1 }).toISOString(),
    updatedAt:
      overrides?.updatedAt ?? faker.date.recent({ days: 30 }).toISOString(),
  }
}

export const publicationStore = {
  ensure: (id: string, overrides?: Partial<Publication>) => {
    if (!publications.has(id)) {
      const publication = buildPublication(id, overrides)
      publications.set(id, publication)
    } else if (overrides) {
      const current = publications.get(id)
      if (current) {
        publications.set(id, { ...current, ...overrides })
      }
    }
    return publications.get(id) ?? buildPublication(id, overrides)
  },
  upsert: (publication: Publication) => {
    publications.set(publication.id, publication)
    return publication
  },
  update: (id: string, input: PublicationUpdate) => {
    const current = publications.get(id)
    if (!current) {
      throw new Error(`Publication ${id} not found`)
    }
    const next = applyPublicationUpdate(current, input)
    publications.set(id, next)
    return next
  },
  get: (id: string) => publications.get(id),
  seedFromPreview: (
    id: string,
    seed: {
      title: string
      author: string
      coverUrl?: string
      status?: PublicationStatus
      isOwner?: boolean
    }
  ) => {
    const cover =
      seed.coverUrl ??
      `https://placehold.co/400x600?text=${encodeURIComponent(seed.title)}`
    return publicationStore.ensure(id, {
      metadata: {
        title: seed.title,
        author: seed.author,
      },
      status: seed.status ?? 'available',
      isOwner: seed.isOwner ?? false,
      images: defaultImages(cover),
    })
  },
  all: () => Array.from(publications.values()),
}
