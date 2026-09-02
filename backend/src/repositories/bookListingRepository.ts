import { query, withTransaction, type DbClient } from '../db.js';
import { type NewBook } from './bookRepository.js';

export type BookListingStatus =
  | 'draft'
  | 'available'
  | 'reserved'
  | 'inactive'
  | 'completed'
  | 'sold'
  | 'exchanged';
export type BookListingType = 'offer' | 'want';
export type BookListingAvailability = 'public' | 'private';
export type BookListingCondition = 'new' | 'very_good' | 'good' | 'acceptable';
export type BookListingShippingPayer = 'owner' | 'requester' | 'split';
export type BookListingSort = 'recent' | 'nearby' | 'price_asc' | 'price_desc';
export type PublicationEditorialStatus =
  | 'pending'
  | 'needs_correction'
  | 'approved'
  | 'rejected';

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
  editorialStatus: PublicationEditorialStatus;
  editorialReason: string | null;
  consents: PublicationConsents;
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
  expiresAt: Date | null;
  images: BookListingImage[];
  isInterested?: boolean;
}

export interface PublicationConsents {
  content: boolean;
  image: boolean;
  rules: boolean;
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
  editorial_status: PublicationEditorialStatus;
  editorial_reason: string | null;
  content_consent: boolean;
  image_consent: boolean;
  rules_consent: boolean;
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
  expires_at: Date | null;
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
  consents?: PublicationConsents;
  editorialStatus?: PublicationEditorialStatus;
  editorialReason?: string | null;
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
  consents?: PublicationConsents;
  cornerId: string | null;
  delivery: BookListingDelivery;
  images: BookListingImageInput[];
}

export interface NewWantBookListing {
  userId: number;
  book: NewBook;
  notes?: string | null;
  availability?: BookListingAvailability;
  consents?: PublicationConsents;
}

export type CreateWantBookListingResult =
  | { kind: 'created'; listing: BookListing }
  | { kind: 'duplicate'; listing: BookListing };

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
    p.editorial_status,
    p.editorial_reason,
    p.content_consent,
    p.image_consent,
    p.rules_consent,
    p.delivery_near_book_corner,
    p.delivery_in_person,
    p.delivery_shipping,
    p.delivery_shipping_payer,
    p.corner_id,
    p.created_at,
    p.updated_at,
    p.expires_at,
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
    editorialStatus: row.editorial_status,
    editorialReason: row.editorial_reason,
    consents: {
      content: row.content_consent,
      image: row.image_consent,
      rules: row.rules_consent,
    },
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
    expiresAt: row.expires_at,
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
  params: unknown[],
  orderClause = 'ORDER BY p.created_at DESC'
): Promise<BookListing[]> {
  const { rows } = await query<BookListingRow>(
    `${BOOK_LISTING_SELECT} ${whereClause} ${orderClause}`,
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

    // 2) Insert listing
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
      consents,
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
        content_consent,
        image_consent,
        rules_consent,
        delivery_near_book_corner,
        delivery_in_person,
        delivery_shipping,
        delivery_shipping_payer,
        corner_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22
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
        consents?.content ?? true,
        consents?.image ?? true,
        consents?.rules ?? true,
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
      if (listing.consents !== undefined) {
        fields.push(`content_consent = $${index++}`);
        values.push(listing.consents.content);
        fields.push(`image_consent = $${index++}`);
        values.push(listing.consents.image);
        fields.push(`rules_consent = $${index++}`);
        values.push(listing.consents.rules);
      }
      if (listing.editorialStatus !== undefined) {
        fields.push(`editorial_status = $${index++}`);
        values.push(listing.editorialStatus);
      }
      if (listing.editorialReason !== undefined) {
        fields.push(`editorial_reason = $${index++}`);
        values.push(listing.editorialReason);
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

export async function updateBookListingEditorial(
  id: number,
  status: PublicationEditorialStatus,
  reason: string | null
): Promise<BookListing | null> {
  return withTransaction(async (client) => {
    const updated = await client.query<{ id: number }>(
      `UPDATE book_listings
       SET editorial_status = $1, editorial_reason = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id`,
      [status, reason, id]
    );
    if (!updated.rows[0]) return null;
    return fetchBookListingByIdWithClient(client, id);
  });
}

async function findOrCreateBookWithClient(
  client: DbClient,
  book: NewBook
): Promise<number> {
  const normalized = normalizeNewBook(book);
  const existing = normalized.isbn
    ? await client.query<{ id: number }>(
        'SELECT id FROM books WHERE isbn = $1 ORDER BY id LIMIT 1',
        [normalized.isbn]
      )
    : await client.query<{ id: number }>(
        `SELECT id
         FROM books
         WHERE lower(trim(title)) = lower(trim($1))
           AND lower(trim(coalesce(author, ''))) = lower(trim(coalesce($2, '')))
         ORDER BY id
         LIMIT 1`,
        [normalized.title, normalized.author]
      );

  if (existing.rows[0]) return existing.rows[0].id;

  const created = await client.query<{ id: number }>(
    `INSERT INTO books (
      title, author, publisher, published_year, language, format, isbn, cover_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      normalized.title,
      normalized.author,
      normalized.publisher,
      normalized.publishedYear,
      normalized.language,
      normalized.format,
      normalized.isbn,
      normalized.coverUrl,
    ]
  );
  return created.rows[0].id;
}

async function createWantBookListingWithClient(
  client: DbClient,
  input: NewWantBookListing
): Promise<CreateWantBookListingResult> {
  const bookId = await findOrCreateBookWithClient(client, input.book);
  const availability = input.availability ?? 'public';
  const description = input.notes ?? null;
  const inserted = await client.query<{ id: number }>(
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
      trade_preferences,
      availability,
      is_draft,
      delivery_near_book_corner,
      delivery_in_person,
      delivery_shipping,
      content_consent,
      image_consent,
      rules_consent
    ) VALUES (
      $1, $2, 'available', 'want', $3, NULL, false, false, false, ARRAY[]::TEXT[],
      $4, false, false, false, false, $5, $6, $7
    )
    ON CONFLICT (user_id, book_id)
      WHERE type = 'want' AND is_draft = false AND status = 'available'
    DO NOTHING
    RETURNING id`,
    [
      input.userId,
      bookId,
      description,
      availability,
      input.consents?.content ?? true,
      input.consents?.image ?? true,
      input.consents?.rules ?? true,
    ]
  );

  if (inserted.rows[0]) {
    const listing = await fetchBookListingByIdWithClient(
      client,
      inserted.rows[0].id
    );
    if (!listing) throw new Error('Book want creation failed');
    return { kind: 'created', listing };
  }

  const duplicate = await client.query<{ id: number }>(
    `SELECT id
     FROM book_listings
     WHERE user_id = $1
       AND book_id = $2
       AND type = 'want'
       AND is_draft = false
       AND status = 'available'
     ORDER BY id DESC
     LIMIT 1`,
    [input.userId, bookId]
  );
  const duplicateListing = duplicate.rows[0]
    ? await fetchBookListingByIdWithClient(client, duplicate.rows[0].id)
    : null;
  if (!duplicateListing) throw new Error('Book want lookup failed');
  return { kind: 'duplicate', listing: duplicateListing };
}

export async function createWantBookListing(
  input: NewWantBookListing
): Promise<CreateWantBookListingResult> {
  return withTransaction((client) =>
    createWantBookListingWithClient(client, input)
  );
}

export type CreateWantFromListingResult =
  | CreateWantBookListingResult
  | { kind: 'not_found' }
  | { kind: 'forbidden' };

export async function createWantBookListingFromListing(
  listingId: number,
  userId: number
): Promise<CreateWantFromListingResult> {
  return withTransaction(async (client) => {
    const source = await fetchBookListingByIdWithClient(client, listingId);
    if (!source || !isPublicActiveListing(source)) {
      return { kind: 'not_found' };
    }
    if (source.userId === userId) {
      return { kind: 'forbidden' };
    }
    if (
      await hasBlockingRelationshipWithClient(client, userId, source.userId)
    ) {
      return { kind: 'not_found' };
    }

    return createWantBookListingWithClient(client, {
      userId,
      book: {
        title: source.title,
        author: source.author,
        publisher: source.metadata.publisher,
        publishedYear: source.metadata.publishedYear,
        language: source.metadata.language,
        format: source.metadata.format,
        isbn: source.metadata.isbn,
        coverUrl: source.metadata.coverUrl,
        verified: true,
      },
    });
  });
}

type BookListingInterestResult =
  | { kind: 'added'; interested: true }
  | { kind: 'removed'; interested: false }
  | { kind: 'not_found' }
  | { kind: 'forbidden' };

export async function toggleBookListingInterest(
  listingId: number,
  userId: number
): Promise<BookListingInterestResult> {
  return withTransaction(async (client) => {
    const listing = await fetchBookListingByIdWithClient(client, listingId);
    if (!listing || !isPublicActiveListing(listing)) {
      return { kind: 'not_found' };
    }
    if (listing.userId === userId) {
      return { kind: 'forbidden' };
    }
    if (
      await hasBlockingRelationshipWithClient(client, userId, listing.userId)
    ) {
      return { kind: 'not_found' };
    }

    const removed = await client.query<{ book_listing_id: number }>(
      `DELETE FROM user_book_listing_interests
       WHERE user_id = $1 AND book_listing_id = $2
       RETURNING book_listing_id`,
      [userId, listingId]
    );
    if (removed.rows[0]) return { kind: 'removed', interested: false };

    await client.query(
      `INSERT INTO user_book_listing_interests (user_id, book_listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, book_listing_id) DO NOTHING`,
      [userId, listingId]
    );
    return { kind: 'added', interested: true };
  });
}

function isPublicActiveListing(listing: BookListing): boolean {
  return (
    listing.availability === 'public' &&
    !listing.isDraft &&
    listing.status !== 'draft' &&
    listing.editorialStatus === 'approved' &&
    !['completed', 'sold', 'exchanged', 'inactive'].includes(listing.status) &&
    (!listing.expiresAt || listing.expiresAt.getTime() > Date.now())
  );
}

async function hasBlockingRelationshipWithClient(
  client: DbClient,
  viewerId: number,
  ownerId: number
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM user_blocks
       WHERE (blocker_id = $1 AND blocked_id = $2)
          OR (blocker_id = $2 AND blocked_id = $1)
     ) AS exists`,
    [viewerId, ownerId]
  );
  return result.rows[0]?.exists ?? false;
}

export async function listUserBookListings(
  userId: number
): Promise<BookListing[]> {
  return fetchBookListings('WHERE p.user_id = $1', [userId]);
}

export async function hasExactActiveBookListing(input: {
  userId: number;
  type: BookListingType;
  title: string;
  author: string | null;
  isbn: string | null;
}): Promise<boolean> {
  const result = await query<{ id: number }>(
    `SELECT p.id
     FROM book_listings p
     JOIN books b ON b.id = p.book_id
     WHERE p.user_id = $1
       AND p.type = $2
       AND p.status = 'available'
       AND p.is_draft = false
       AND p.editorial_status IN ('pending', 'needs_correction', 'approved')
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND lower(trim(b.title)) = lower(trim($3))
       AND lower(trim(coalesce(b.author, ''))) = lower(trim(coalesce($4, '')))
       AND coalesce(b.isbn, '') = coalesce($5, '')
     LIMIT 1`,
    [input.userId, input.type, input.title, input.author, input.isbn]
  );
  return result.rows.length > 0;
}

export async function listPublicBookListingsForUser(
  userId: number
): Promise<BookListing[]> {
  return fetchBookListings(
    `WHERE p.user_id = $1
       AND p.availability = 'public'
       AND p.is_draft = false
       AND p.status = 'available'
       AND p.editorial_status = 'approved'
       AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
    [userId],
    'ORDER BY p.created_at DESC'
  );
}

export async function renewBookListing(
  id: number,
  userId: number
): Promise<BookListing | null> {
  return withTransaction(async (client) => {
    const result = await client.query<{ id: number }>(
      `UPDATE book_listings
       SET status = 'available', is_draft = false,
           editorial_status = 'approved', editorial_reason = NULL,
           expires_at = NOW() + INTERVAL '30 days', updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
    if (!result.rows[0]) return null;
    return fetchBookListingByIdWithClient(client, id);
  });
}

export interface PublicBookListingFilters {
  text?: string;
  author?: string;
  isbn?: string;
  topic?: string;
  interest?: string;
  language?: string;
  condition?: BookListingCondition;
  status?: BookListingStatus;
  type?: BookListingType;
  trade?: boolean;
  sale?: boolean;
  donation?: boolean;
  sort?: BookListingSort;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  /** Internal projection filter used by the map; never exposed as a query parameter. */
  cornerIds?: string[];
}

export async function listPublicBookListings(
  filters: PublicBookListingFilters = {},
  viewerId?: number
): Promise<BookListing[]> {
  const conditions = [
    "p.availability = 'public'",
    'p.is_draft = false',
    "p.status NOT IN ('completed', 'sold', 'exchanged', 'inactive')",
    '(p.expires_at IS NULL OR p.expires_at > NOW())',
    "p.editorial_status = 'approved'",
  ];
  const params: unknown[] = [];
  const add = (condition: string, value: unknown) => {
    params.push(value);
    conditions.push(condition.replace('?', `$${params.length}`));
  };
  if (filters.text) {
    params.push(filters.text, filters.text, filters.text, filters.text);
    conditions.push(
      `(b.title ILIKE '%' || $${params.length - 3} || '%'
        OR b.author ILIKE '%' || $${params.length - 2} || '%'
        OR c.name ILIKE '%' || $${params.length - 1} || '%'
        OR c.address_street ILIKE '%' || $${params.length} || '%')`
    );
  }
  if (filters.author) add("b.author ILIKE '%' || ? || '%'", filters.author);
  if (filters.isbn) add('b.isbn = ?', filters.isbn);
  if (filters.topic) {
    add(
      "(b.title || ' ' || COALESCE(p.description, '')) ILIKE '%' || ? || '%'",
      filters.topic
    );
  }
  if (filters.interest) {
    add(
      'EXISTS (SELECT 1 FROM unnest(p.trade_preferences) AS preference WHERE preference ILIKE ?)',
      filters.interest
    );
  }
  if (filters.language) add('b.language = ?', filters.language);
  if (filters.condition) add('p.condition = ?', filters.condition);
  if (filters.status) add('p.status = ?', filters.status);
  if (filters.type) add('p.type = ?', filters.type);
  if (filters.trade !== undefined) add('p.trade = ?', filters.trade);
  if (filters.sale !== undefined) add('p.sale = ?', filters.sale);
  if (filters.donation !== undefined) add('p.donation = ?', filters.donation);
  if (filters.cornerIds) {
    if (filters.cornerIds.length === 0) return [];
    add('p.corner_id = ANY(?::text[])', filters.cornerIds);
  }

  let distanceExpression: string | null = null;
  if (
    filters.latitude !== undefined &&
    filters.longitude !== undefined &&
    filters.radiusKm !== undefined
  ) {
    params.push(filters.longitude, filters.latitude, filters.radiusKm * 1000);
    const lon = params.length - 2;
    const lat = params.length - 1;
    const radius = params.length;
    distanceExpression = `ST_Distance(COALESCE(c.location, u.location), ST_SetSRID(ST_MakePoint($${lon}, $${lat}), 4326)::geography)`;
    conditions.push(
      `COALESCE(c.location, u.location) IS NOT NULL AND ST_DWithin(COALESCE(c.location, u.location), ST_SetSRID(ST_MakePoint($${lon}, $${lat}), 4326)::geography, $${radius})`
    );
  }
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
  const offset = Math.max(filters.offset ?? 0, 0);
  params.push(limit, offset);
  const orderClause = getPublicListingOrder(filters.sort, distanceExpression);
  const listings = await fetchBookListings(
    `JOIN users u ON u.id = p.user_id
     LEFT JOIN community_corners c ON c.id::text = p.corner_id
     WHERE ${conditions.join(' AND ')}`,
    params,
    `${orderClause} LIMIT $${params.length - 1} OFFSET $${params.length}`
  );

  if (!viewerId || listings.length === 0) return listings;

  const listingIds = listings.map((listing) => listing.id);
  const { rows } = await query<{ book_listing_id: number }>(
    `SELECT book_listing_id
     FROM user_book_listing_interests
     WHERE user_id = $1 AND book_listing_id = ANY($2::integer[])`,
    [viewerId, listingIds]
  );
  const interestedIds = new Set(rows.map((row) => row.book_listing_id));
  return listings.map((listing) => ({
    ...listing,
    isInterested: interestedIds.has(listing.id),
  }));
}

function getPublicListingOrder(
  sort: BookListingSort | undefined,
  distanceExpression: string | null
): string {
  if (sort === 'nearby' && distanceExpression) {
    return `ORDER BY ${distanceExpression} ASC, p.created_at DESC, p.id DESC`;
  }
  if (sort === 'price_asc') {
    return 'ORDER BY p.price_amount IS NULL, p.price_amount ASC, p.created_at DESC';
  }
  if (sort === 'price_desc') {
    return 'ORDER BY p.price_amount IS NULL, p.price_amount DESC, p.created_at DESC';
  }
  return 'ORDER BY p.created_at DESC, p.id DESC';
}

export async function listHomeBookListings(
  viewerId?: number,
  options: { limit?: number; offset?: number } = {}
): Promise<{
  items: BookListing[];
  page: {
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}> {
  const safeLimit = Math.min(Math.max(Math.trunc(options.limit ?? 5), 1), 5);
  const safeOffset = Math.max(Math.trunc(options.offset ?? 0), 0);
  const listings = await fetchBookListings(
    `JOIN users u ON u.id = p.user_id
     WHERE p.availability = 'public'
       AND p.is_draft = false
       AND p.status NOT IN ('completed', 'sold', 'exchanged', 'inactive')
       AND p.editorial_status = 'approved'
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND u.profile_visibility = 'public'
       AND ($1::integer IS NULL OR p.user_id <> $1)
       AND (
         $1::integer IS NULL
         OR NOT EXISTS (
           SELECT 1
           FROM user_blocks b
           WHERE (b.blocker_id = $1 AND b.blocked_id = p.user_id)
              OR (b.blocker_id = p.user_id AND b.blocked_id = $1)
         )
       )`,
    [viewerId ?? null, safeLimit + 1, safeOffset],
    `ORDER BY CASE
                WHEN $1::integer IS NOT NULL AND EXISTS (
                  SELECT 1
                  FROM user_follows f
                  WHERE f.follower_id = $1 AND f.followed_id = p.user_id
                ) THEN 0
                ELSE 1
              END,
              p.created_at DESC,
              p.id DESC
              LIMIT $2 OFFSET $3`
  );

  return {
    items: listings.slice(0, safeLimit),
    page: {
      limit: safeLimit,
      offset: safeOffset,
      hasNext: listings.length > safeLimit,
      hasPrevious: safeOffset > 0,
    },
  };
}
