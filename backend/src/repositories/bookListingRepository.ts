import { query, withTransaction, type DbClient } from '../db.js';
import { type NewBook } from './bookRepository.js';

export type BookListingStatus = 'draft' | 'available' | 'reserved' | 'inactive';
export type BookListingType = 'offer' | 'want';
export type BookListingAvailability = 'public' | 'private';
export type BookListingCondition = 'new' | 'very_good' | 'good' | 'acceptable';
export type BookListingShippingPayer = 'owner' | 'requester' | 'split';

export interface BookListingDelivery {
  nearBookCorner: boolean;
  inPerson: boolean;
  shipping: boolean;
  shippingPayer: BookListingShippingPayer | null;
}

export interface BookListing {
  id: number;
  userId: number;
  bookId: number;
  title: string;
  author: string | null;
  coverUrl: string;
  condition: BookListingCondition | null;
  status: BookListingStatus;
  type: BookListingType;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  priceAmount: number | null;
  priceCurrency: string | null;
  tradePreferences: string[];
  notes: string | null;
  availability: BookListingAvailability;
  isDraft: boolean;
  isSeeking: boolean;
  cornerId: string | null;
  delivery: BookListingDelivery;
  metadata: {
    publisher: string | null;
    publishedYear: number | null;
    language: string | null;
    format: string | null;
    isbn: string | null;
    coverUrl: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  images: BookListingImage[];
}

export interface BookListingImage {
  id: number;
  url: string;
  isPrimary: boolean;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface BookListingRow {
  id: number;
  user_id: number;
  book_id: number;
  status: BookListingStatus;
  type: BookListingType;
  condition: BookListingCondition | null;
  description: string | null;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  price_amount: string | null;
  price_currency: string | null;
  trade_preferences: string[] | null;
  availability: BookListingAvailability;
  is_draft: boolean;
  delivery_near_book_corner: boolean;
  delivery_in_person: boolean;
  delivery_shipping: boolean;
  delivery_shipping_payer: BookListingShippingPayer | null;
  corner_id: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  published_year: number | null;
  language: string | null;
  format: string | null;
  isbn: string | null;
  book_cover_url: string | null;
  primary_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface BookListingImageRow {
  id: number;
  book_listing_id: number;
  url: string;
  is_primary: boolean;
  source: string | null;
  metadata: unknown;
  created_at: Date;
}

export interface BookListingImageInput {
  url: string;
  source?: string | null;
  isPrimary?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface BookUpdateInput {
  title?: string;
  author?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  language?: string | null;
  format?: string | null;
  isbn?: string | null;
  coverUrl?: string | null;
}

export interface BookListingUpdateInput {
  status?: BookListingStatus;
  isDraft?: boolean;
  condition?: BookListingCondition | null;
  notes?: string | null;
  sale?: boolean;
  donation?: boolean;
  trade?: boolean;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  tradePreferences?: string[];
  availability?: BookListingAvailability;
  delivery?: {
    nearBookCorner?: boolean;
    inPerson?: boolean;
    shipping?: boolean;
    shippingPayer?: BookListingShippingPayer | null;
  };
  cornerId?: string | null;
}

export interface PersistedBookListingUpdate {
  book?: BookUpdateInput;
  listing?: BookListingUpdateInput;
  images?: BookListingImageInput[];
}

export interface NewBookListing {
  userId: number;
  book: NewBook;
  type: BookListingType;
  condition: BookListingCondition | null;
  notes: string | null;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  priceAmount: number | null;
  priceCurrency: string | null;
  tradePreferences: string[];
  availability: BookListingAvailability;
  isDraft: boolean;
  cornerId: string | null;
  delivery: BookListingDelivery;
  images: BookListingImageInput[];
}

const BOOK_LISTING_SELECT = `
  SELECT
    p.id,
    p.user_id,
    p.book_id,
    p.status,
    p.type,
    p.condition,
    p.description,
    p.sale,
    p.donation,
    p.trade,
    p.price_amount,
    p.price_currency,
    p.trade_preferences,
    p.availability,
    p.is_draft,
    p.delivery_near_book_corner,
    p.delivery_in_person,
    p.delivery_shipping,
    p.delivery_shipping_payer,
    p.corner_id,
    p.created_at,
    p.updated_at,
    b.title,
    b.author,
    b.publisher,
    b.published_year,
    b.language,
    b.format,
    b.isbn,
    b.cover_url AS book_cover_url,
    img.url AS primary_image_url
  FROM book_listings p
         JOIN books b ON p.book_id = b.id
         LEFT JOIN LATERAL (
    SELECT url
    FROM book_listing_images
    WHERE book_listing_id = p.id
    ORDER BY is_primary DESC, id ASC
    LIMIT 1
    ) img ON true
`;

function mapRow(row: BookListingRow): BookListing {
  const priceAmount = row.price_amount ? Number(row.price_amount) : null;
  const tradePreferences = row.trade_preferences ?? [];
  const coverUrl = row.primary_image_url ?? row.book_cover_url ?? '';
  const shippingPayer = row.delivery_shipping
    ? row.delivery_shipping_payer
    : null;
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    title: row.title,
    author: row.author,
    coverUrl,
    condition: row.condition,
    status: row.status,
    type: row.type,
    sale: row.sale,
    donation: row.donation,
    trade: row.trade,
    priceAmount,
    priceCurrency: row.price_currency,
    tradePreferences,
    notes: row.description,
    availability: row.availability,
    isDraft: row.is_draft,
    isSeeking: row.type === 'want',
    cornerId: row.corner_id,
    delivery: {
      nearBookCorner: row.delivery_near_book_corner,
      inPerson: row.delivery_in_person,
      shipping: row.delivery_shipping,
      shippingPayer,
    },
    metadata: {
      publisher: row.publisher,
      publishedYear: row.published_year,
      language: row.language,
      format: row.format,
      isbn: row.isbn,
      coverUrl: row.book_cover_url,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: [],
  };
}

function mapImageRow(row: BookListingImageRow): BookListingImage {
  const metadata =
    row.metadata && typeof row.metadata === 'object'
      ? (row.metadata as Record<string, unknown>)
      : null;
  return {
    id: row.id,
    url: row.url,
    isPrimary: row.is_primary,
    source: row.source,
    metadata,
    createdAt: row.created_at,
  };
}

function normalizeNewBook(b: NewBook) {
  return {
    title: b.title,
    author: b.author ?? null,
    publisher: b.publisher ?? null,
    publishedYear: b.publishedYear ?? null,
    language: b.language ?? null,
    format: b.format ?? null,
    isbn: b.isbn ?? null,
    coverUrl: b.coverUrl ?? null,
  };
}

async function fetchBookListings(
  whereClause: string,
  params: unknown[]
): Promise<BookListing[]> {
  const { rows } = await query<BookListingRow>(
    `${BOOK_LISTING_SELECT} ${whereClause} ORDER BY p.created_at DESC`,
    params
  );
  return rows.map(mapRow);
}

async function fetchBookListingsWithClient(
  client: DbClient,
  whereClause: string,
  params: unknown[]
) {
  const { rows } = await client.query<BookListingRow>(
    `${BOOK_LISTING_SELECT} ${whereClause} ORDER BY p.created_at DESC`,
    params as any[]
  );
  return rows.map(mapRow);
}

async function fetchBookListingImagesWithClient(
  client: DbClient,
  listingId: number
): Promise<BookListingImage[]> {
  const { rows } = await client.query<BookListingImageRow>(
    `SELECT id, book_listing_id, url, is_primary, source, metadata, created_at
     FROM book_listing_images
     WHERE book_listing_id = $1
     ORDER BY is_primary DESC, id ASC`,
    [listingId]
  );
  return rows.map(mapImageRow);
}

async function fetchBookListingByIdWithClient(
  client: DbClient,
  id: number
): Promise<BookListing | null> {
  const pubs = await fetchBookListingsWithClient(client, 'WHERE p.id = $1', [
    id,
  ]);
  if (!pubs[0]) {
    return null;
  }
  const images = await fetchBookListingImagesWithClient(client, id);
  return { ...pubs[0], images };
}

export async function getBookListingById(
  id: number
): Promise<BookListing | null> {
  return withTransaction(async (client) => {
    return fetchBookListingByIdWithClient(client, id);
  });
}

export async function createBookListing(
  listing: NewBookListing
): Promise<BookListing> {
  return withTransaction(async (client) => {
    // 1) Insert book
    const nb = normalizeNewBook(listing.book);
    const bookRes = await client.query<{ id: number }>(
      `INSERT INTO books (
        title, author, publisher, published_year, language, format, isbn, cover_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        nb.title,
        nb.author,
        nb.publisher,
        nb.publishedYear,
        nb.language,
        nb.format,
        nb.isbn,
        nb.coverUrl,
      ]
    );
    const bookId = bookRes.rows[0].id;

    // 2) Insert listing (books)
    const {
      userId,
      type,
      condition,
      notes,
      sale,
      donation,
      trade,
      priceAmount,
      priceCurrency,
      tradePreferences,
      availability,
      isDraft,
      cornerId,
      delivery,
      images,
    } = listing;

    const pubRes = await client.query<{ id: number }>(
      `INSERT INTO book_listings (
        user_id,
        book_id,
        status,
        type,
        description,
        condition,
        sale,
        donation,
        trade,
        price_amount,
        price_currency,
        trade_preferences,
        availability,
        is_draft,
        delivery_near_book_corner,
        delivery_in_person,
        delivery_shipping,
        delivery_shipping_payer,
        corner_id
      ) VALUES (
                 $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
               )
       RETURNING id`,
      [
        userId,
        bookId,
        isDraft ? 'draft' : 'available',
        type,
        notes,
        condition,
        sale,
        donation,
        trade,
        sale && priceAmount !== null ? priceAmount : null,
        sale && priceCurrency ? priceCurrency : null,
        tradePreferences,
        availability,
        isDraft,
        delivery.nearBookCorner,
        delivery.inPerson,
        delivery.shipping,
        delivery.shipping ? delivery.shippingPayer : null,
        cornerId,
      ]
    );

    const bookListingId = pubRes.rows[0].id;

    // 3) Insert images
    if (images.length > 0) {
      const inserts = images.map((image, index) => {
        const metadata =
          image.metadata ?? (image.source ? { source: image.source } : null);
        return client.query(
          `INSERT INTO book_listing_images (
            book_listing_id,
            url,
            is_primary,
            source,
            metadata
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            bookListingId,
            image.url,
            image.isPrimary ?? index === 0,
            image.source ?? null,
            metadata ? JSON.stringify(metadata) : null,
          ]
        );
      });
      await Promise.all(inserts);
    }

    // 4) Fetch created listing inside the same transaction
    const created = await fetchBookListingByIdWithClient(client, bookListingId);
    if (!created) {
      throw new Error('Book listing creation failed');
    }
    return created;
  });
}

export async function updateBookListing(
  id: number,
  updates: PersistedBookListingUpdate
): Promise<BookListing | null> {
  return withTransaction(async (client) => {
    const existing = await fetchBookListingByIdWithClient(client, id);
    if (!existing) {
      return null;
    }

    if (updates.book) {
      const fields: string[] = [];
      const values: unknown[] = [];
      let index = 1;
      const { book } = updates;
      if (book.title !== undefined) {
        fields.push(`title = $${index++}`);
        values.push(book.title);
      }
      if (book.author !== undefined) {
        fields.push(`author = $${index++}`);
        values.push(book.author);
      }
      if (book.publisher !== undefined) {
        fields.push(`publisher = $${index++}`);
        values.push(book.publisher);
      }
      if (book.publishedYear !== undefined) {
        fields.push(`published_year = $${index++}`);
        values.push(book.publishedYear);
      }
      if (book.language !== undefined) {
        fields.push(`language = $${index++}`);
        values.push(book.language);
      }
      if (book.format !== undefined) {
        fields.push(`format = $${index++}`);
        values.push(book.format);
      }
      if (book.isbn !== undefined) {
        fields.push(`isbn = $${index++}`);
        values.push(book.isbn);
      }
      if (book.coverUrl !== undefined) {
        fields.push(`cover_url = $${index++}`);
        values.push(book.coverUrl);
      }
      if (fields.length > 0) {
        values.push(existing.bookId);
        await client.query(
          `UPDATE books SET ${fields.join(', ')} WHERE id = $${index}`,
          values
        );
      }
    }

    if (updates.listing) {
      const fields: string[] = [];
      const values: unknown[] = [];
      let index = 1;
      const { listing } = updates;
      if (listing.status !== undefined) {
        fields.push(`status = $${index++}`);
        values.push(listing.status);
      }
      if (listing.isDraft !== undefined) {
        fields.push(`is_draft = $${index++}`);
        values.push(listing.isDraft);
      }
      if (listing.condition !== undefined) {
        fields.push(`condition = $${index++}`);
        values.push(listing.condition);
      }
      if (listing.notes !== undefined) {
        fields.push(`description = $${index++}`);
        values.push(listing.notes);
      }
      if (listing.sale !== undefined) {
        fields.push(`sale = $${index++}`);
        values.push(listing.sale);
      }
      if (listing.donation !== undefined) {
        fields.push(`donation = $${index++}`);
        values.push(listing.donation);
      }
      if (listing.trade !== undefined) {
        fields.push(`trade = $${index++}`);
        values.push(listing.trade);
      }
      if (listing.priceAmount !== undefined) {
        fields.push(`price_amount = $${index++}`);
        values.push(listing.priceAmount);
      }
      if (listing.priceCurrency !== undefined) {
        fields.push(`price_currency = $${index++}`);
        values.push(listing.priceCurrency);
      }
      if (listing.tradePreferences !== undefined) {
        fields.push(`trade_preferences = $${index++}`);
        values.push(listing.tradePreferences);
      }
      if (listing.availability !== undefined) {
        fields.push(`availability = $${index++}`);
        values.push(listing.availability);
      }
      if (listing.delivery) {
        if (listing.delivery.nearBookCorner !== undefined) {
          fields.push(`delivery_near_book_corner = $${index++}`);
          values.push(listing.delivery.nearBookCorner);
        }
        if (listing.delivery.inPerson !== undefined) {
          fields.push(`delivery_in_person = $${index++}`);
          values.push(listing.delivery.inPerson);
        }
        if (listing.delivery.shipping !== undefined) {
          fields.push(`delivery_shipping = $${index++}`);
          values.push(listing.delivery.shipping);
        }
        if (listing.delivery.shippingPayer !== undefined) {
          fields.push(`delivery_shipping_payer = $${index++}`);
          values.push(listing.delivery.shippingPayer);
        }
      }
      if (listing.cornerId !== undefined) {
        fields.push(`corner_id = $${index++}`);
        values.push(listing.cornerId);
      }
      if (fields.length > 0) {
        fields.push('updated_at = NOW()');
        values.push(id);
        await client.query(
          `UPDATE book_listings SET ${fields.join(', ')} WHERE id = $${index}`,
          values
        );
      }
    }

    if (updates.images !== undefined) {
      await client.query(
        'DELETE FROM book_listing_images WHERE book_listing_id = $1',
        [id]
      );
      if (updates.images.length > 0) {
        for (const [index, image] of updates.images.entries()) {
          const metadata =
            image.metadata ?? (image.source ? { source: image.source } : null);
          await client.query(
            `INSERT INTO book_listing_images (
              book_listing_id,
              url,
              is_primary,
              source,
              metadata
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              image.url,
              image.isPrimary ?? index === 0,
              image.source ?? null,
              metadata ? JSON.stringify(metadata) : null,
            ]
          );
        }
      }
    }

    return fetchBookListingByIdWithClient(client, id);
  });
}

export async function listUserBookListings(
  userId: number
): Promise<BookListing[]> {
  return fetchBookListings('WHERE p.user_id = $1', [userId]);
}

export async function listPublicBookListings(): Promise<BookListing[]> {
  return fetchBookListings(
    "WHERE p.status = 'available' AND p.availability = 'public' AND p.is_draft = false",
    []
  );
}
