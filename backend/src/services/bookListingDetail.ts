import {
  getBookListingById,
  listBookListingImages,
  type BookListing,
  type BookListingAvailability,
  type BookListingCondition,
  type BookListingImage,
  type BookListingShippingPayer,
  type BookListingStatus,
  type BookListingType,
} from '../repositories/bookListingRepository.js';
import {
  mapBookListingStatus,
  type UiBookListingStatus,
} from './bookListingStatus.js';

export interface BookListingDetailOffer {
  sale: boolean;
  donation: boolean;
  trade: boolean;
  price: { amount: number; currency: string } | null;
  tradePreferences: string[];
  availability: BookListingAvailability;
  delivery: {
    nearBookCorner: boolean;
    inPerson: boolean;
    shipping: boolean;
    shippingPayer: BookListingShippingPayer | null;
  };
}

export interface BookListingDetailImage {
  id: string;
  url: string;
  source: 'cover' | 'upload';
  isPrimary: boolean;
}

export interface BookListingDetail {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  publisher: string | null;
  year: number | null;
  language: string | null;
  format: string | null;
  isbn: string | null;
  condition: BookListingCondition | null;
  status: UiBookListingStatus;
  bookListingStatus: BookListingStatus;
  notes: string | null;
  images: BookListingDetailImage[];
  offer: BookListingDetailOffer;
  cornerId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  type: BookListingType;
  draft: boolean;
}

export async function getBookListingDetail(
  id: number
): Promise<BookListingDetail | null> {
  const listing = await getBookListingById(id);
  if (!listing) {
    return null;
  }

  const images = await listBookListingImages(id);
  return toBookListingDetail(listing, images);
}

export function toBookListingDetail(
  listing: BookListing,
  images: BookListingImage[]
): BookListingDetail {
  const status = mapBookListingStatus(listing);
  const price =
    listing.sale && listing.priceAmount !== null && listing.priceCurrency
      ? { amount: listing.priceAmount, currency: listing.priceCurrency }
      : null;

  return {
    id: String(listing.id),
    title: listing.title,
    author: listing.author ?? '',
    coverUrl: listing.coverUrl,
    publisher: listing.metadata.publisher,
    year: listing.metadata.publishedYear,
    language: listing.metadata.language,
    format: listing.metadata.format,
    isbn: listing.metadata.isbn,
    condition: listing.condition,
    status,
    bookListingStatus: listing.status,
    notes: listing.notes,
    images: images.map((image) => ({
      id: String(image.id),
      url: image.url,
      source: image.source === 'cover' ? 'cover' : 'upload',
      isPrimary: image.isPrimary,
    })),
    offer: {
      sale: listing.sale,
      donation: listing.donation,
      trade: listing.trade,
      price,
      tradePreferences: listing.tradePreferences,
      availability: listing.availability,
      delivery: {
        nearBookCorner: listing.delivery.nearBookCorner,
        inPerson: listing.delivery.inPerson,
        shipping: listing.delivery.shipping,
        shippingPayer: listing.delivery.shippingPayer,
      },
    },
    cornerId: listing.cornerId,
    ownerId: String(listing.userId),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    type: listing.type,
    draft: listing.isDraft,
  };
}
