import { type BookListing } from '../repositories/bookListingRepository.js';

export type UiBookListingStatus =
  | 'draft'
  | 'available'
  | 'reserved'
  | 'completed'
  | 'sold'
  | 'exchanged';

export function mapBookListingStatus(
  listing: Pick<BookListing, 'status' | 'sale' | 'trade'>
): UiBookListingStatus {
  switch (listing.status) {
    case 'draft':
    case 'available':
    case 'reserved':
    case 'completed':
    case 'sold':
    case 'exchanged':
      return listing.status;
    case 'inactive':
      if (listing.sale) {
        return 'sold';
      }
      if (listing.trade) {
        return 'exchanged';
      }
      return 'completed';
    default: {
      const neverValue: never = listing.status;
      throw new Error(`Unsupported status: ${neverValue}`);
    }
  }
}
