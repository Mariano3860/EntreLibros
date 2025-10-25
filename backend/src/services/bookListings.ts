import {
  getBookListingById,
  updateBookListing,
  type BookListing,
  type BookListingImage,
  type BookListingUpdateInput,
  type BookListingAvailability,
  type BookListingStatus,
  type BookListingCondition,
  type BookListingShippingPayer,
  type PersistedBookListingUpdate,
  type BookListingImageInput,
  type BookUpdateInput,
} from '../repositories/bookListingRepository.js';
import { DEFAULT_LISTING_CONDITION } from '../constants.js';

export type PublicationStatus =
  | 'available'
  | 'reserved'
  | 'completed'
  | 'draft';

export interface PublicationImage {
  id: string;
  url: string;
  source: 'cover' | 'upload';
}

export interface PublicationOfferDelivery {
  nearBookCorner: boolean;
  inPerson: boolean;
  shipping: boolean;
  shippingPayer?: BookListingShippingPayer | null;
}

export interface PublicationOffer {
  sale: boolean;
  donation: boolean;
  trade: boolean;
  price: { amount: number; currency: string } | null;
  tradePreferences: string[];
  availability: BookListingAvailability;
  delivery: PublicationOfferDelivery;
}

export interface Publication {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  publisher?: string | null;
  year?: number | null;
  language?: string | null;
  format?: string | null;
  isbn?: string | null;
  condition: BookListingCondition;
  status: PublicationStatus;
  notes?: string | null;
  images: PublicationImage[];
  offer: PublicationOffer;
  cornerId?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationImageUpdate {
  url: string;
  source: 'cover' | 'upload';
  isPrimary?: boolean;
}

export interface PublicationUpdateInput {
  title?: string;
  author?: string | null;
  publisher?: string | null;
  year?: number | null;
  language?: string | null;
  format?: string | null;
  isbn?: string | null;
  condition?: BookListingCondition;
  status?: PublicationStatus;
  notes?: string | null;
  images?: PublicationImageUpdate[];
  offer?: {
    sale?: boolean;
    donation?: boolean;
    trade?: boolean;
    price?: { amount: number; currency: string } | null;
    tradePreferences?: string[];
    availability?: BookListingAvailability;
    delivery?: {
      nearBookCorner?: boolean;
      inPerson?: boolean;
      shipping?: boolean;
      shippingPayer?: BookListingShippingPayer | null;
    };
  };
  cornerId?: string | null;
}

export type UpdatePublicationResult =
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'updated'; publication: Publication };

export async function getPublicationById(
  id: number,
  viewerId?: number
): Promise<Publication | null> {
  const listing = await getBookListingById(id);
  if (!listing) {
    return null;
  }

  if (!canAccessListing(listing, viewerId)) {
    return null;
  }

  return toPublication(listing);
}

export async function updatePublication(
  id: number,
  viewerId: number,
  input: PublicationUpdateInput
): Promise<UpdatePublicationResult> {
  const listing = await getBookListingById(id);
  if (!listing) {
    return { kind: 'not_found' };
  }

  if (listing.userId !== viewerId) {
    return { kind: 'forbidden' };
  }

  const persisted = buildPersistedUpdate(input);
  const updated = await updateBookListing(id, persisted);
  if (!updated) {
    return { kind: 'not_found' };
  }

  return { kind: 'updated', publication: toPublication(updated) };
}

function canAccessListing(listing: BookListing, viewerId?: number) {
  if (viewerId !== undefined && listing.userId === viewerId) {
    return true;
  }

  if (listing.isDraft || listing.status === 'draft') {
    return false;
  }

  if (listing.status === 'inactive') {
    return false;
  }

  if (listing.availability === 'private') {
    return false;
  }

  return true;
}

function toPublication(listing: BookListing): Publication {
  const status = mapStatus(listing.status, listing.isDraft);
  const images = buildPublicationImages(listing.images, listing);
  const coverUrl =
    images[0]?.url ?? listing.coverUrl ?? listing.metadata.coverUrl ?? '';

  const price =
    listing.sale && listing.priceAmount !== null && listing.priceCurrency
      ? { amount: listing.priceAmount, currency: listing.priceCurrency }
      : null;

  const delivery: PublicationOfferDelivery = {
    nearBookCorner: listing.delivery.nearBookCorner,
    inPerson: listing.delivery.inPerson,
    shipping: listing.delivery.shipping,
  };

  if (listing.delivery.shipping) {
    delivery.shippingPayer = listing.delivery.shippingPayer;
  }

  const condition = listing.condition ?? DEFAULT_LISTING_CONDITION;

  return {
    id: String(listing.id),
    title: listing.title,
    author: listing.author ?? '',
    coverUrl,
    publisher: listing.metadata.publisher,
    year: listing.metadata.publishedYear,
    language: listing.metadata.language,
    format: listing.metadata.format,
    isbn: listing.metadata.isbn,
    condition,
    status,
    notes: listing.notes,
    images,
    offer: {
      sale: listing.sale,
      donation: listing.donation,
      trade: listing.trade,
      price,
      tradePreferences: listing.tradePreferences,
      availability: listing.availability,
      delivery,
    },
    cornerId: listing.cornerId,
    ownerId: String(listing.userId),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}

function mapStatus(
  status: BookListingStatus,
  isDraft: boolean
): PublicationStatus {
  if (isDraft || status === 'draft') {
    return 'draft';
  }

  if (status === 'inactive') {
    return 'completed';
  }

  if (status === 'reserved') {
    return 'reserved';
  }

  return 'available';
}

function buildPublicationImages(
  images: BookListingImage[],
  listing: BookListing
): PublicationImage[] {
  const mapped: PublicationImage[] = images.map((image) => {
    const source: PublicationImage['source'] =
      image.source === 'cover' ? 'cover' : 'upload';
    return {
      id: String(image.id),
      url: image.url,
      source,
    };
  });

  if (mapped.length === 0 && listing.metadata.coverUrl) {
    mapped.push({
      id: `cover-${listing.bookId}`,
      url: listing.metadata.coverUrl,
      source: 'cover',
    });
  }

  return mapped;
}

function buildPersistedUpdate(
  input: PublicationUpdateInput
): PersistedBookListingUpdate {
  const persisted: PersistedBookListingUpdate = {};

  const bookUpdates: BookUpdateInput = {};
  if (input.title !== undefined) {
    bookUpdates.title = input.title;
  }
  if (input.author !== undefined) {
    bookUpdates.author = input.author;
  }
  if (input.publisher !== undefined) {
    bookUpdates.publisher = input.publisher;
  }
  if (input.year !== undefined) {
    bookUpdates.publishedYear = input.year;
  }
  if (input.language !== undefined) {
    bookUpdates.language = input.language;
  }
  if (input.format !== undefined) {
    bookUpdates.format = input.format;
  }
  if (input.isbn !== undefined) {
    bookUpdates.isbn = input.isbn;
  }

  if (Object.keys(bookUpdates).length > 0) {
    persisted.book = bookUpdates;
  }

  const listingUpdates: BookListingUpdateInput = {};
  if (input.condition !== undefined) {
    listingUpdates.condition = input.condition;
  }
  if (input.notes !== undefined) {
    listingUpdates.notes = input.notes;
  }
  if (input.status !== undefined) {
    const mappedStatus = mapToBookListingStatus(input.status);
    listingUpdates.status = mappedStatus.status;
    listingUpdates.isDraft = mappedStatus.isDraft;
  }
  if (input.cornerId !== undefined) {
    listingUpdates.cornerId = input.cornerId;
  }

  if (input.offer) {
    const { offer } = input;
    if (offer.sale !== undefined) {
      listingUpdates.sale = offer.sale;
      if (!offer.sale) {
        listingUpdates.priceAmount = null;
        listingUpdates.priceCurrency = null;
      }
    }
    if (offer.donation !== undefined) {
      listingUpdates.donation = offer.donation;
    }
    if (offer.trade !== undefined) {
      listingUpdates.trade = offer.trade;
    }
    if (offer.price !== undefined) {
      if (offer.price === null) {
        listingUpdates.priceAmount = null;
        listingUpdates.priceCurrency = null;
      } else {
        listingUpdates.priceAmount = offer.price.amount;
        listingUpdates.priceCurrency = offer.price.currency;
      }
    }
    if (offer.tradePreferences !== undefined) {
      listingUpdates.tradePreferences = offer.tradePreferences;
    }
    if (offer.availability !== undefined) {
      listingUpdates.availability = offer.availability;
    }
    if (offer.delivery) {
      listingUpdates.delivery = listingUpdates.delivery ?? {};
      const delivery = listingUpdates.delivery;
      if (offer.delivery.nearBookCorner !== undefined) {
        delivery.nearBookCorner = offer.delivery.nearBookCorner;
      }
      if (offer.delivery.inPerson !== undefined) {
        delivery.inPerson = offer.delivery.inPerson;
      }
      if (offer.delivery.shipping !== undefined) {
        delivery.shipping = offer.delivery.shipping;
        if (!offer.delivery.shipping) {
          delivery.shippingPayer = null;
        }
      }
      if (offer.delivery.shippingPayer !== undefined) {
        delivery.shippingPayer = offer.delivery.shippingPayer;
      }
    }
  }

  if (
    listingUpdates.delivery &&
    Object.keys(listingUpdates.delivery).length === 0
  ) {
    delete listingUpdates.delivery;
  }

  if (Object.keys(listingUpdates).length > 0) {
    persisted.listing = listingUpdates;
  }

  if (input.images !== undefined) {
    const images: BookListingImageInput[] = input.images.map(
      (image, index) => ({
        url: image.url,
        source: image.source,
        isPrimary: image.isPrimary ?? index === 0,
        metadata: { source: image.source },
      })
    );

    if (images.length === 0) {
      persisted.images = [];
    } else {
      persisted.images = images;
    }
  }

  return persisted;
}

function mapToBookListingStatus(status: PublicationStatus): {
  status: BookListingStatus;
  isDraft: boolean;
} {
  switch (status) {
    case 'draft':
      return { status: 'draft', isDraft: true };
    case 'reserved':
      return { status: 'reserved', isDraft: false };
    case 'completed':
      return { status: 'inactive', isDraft: false };
    default:
      return { status: 'available', isDraft: false };
  }
}
