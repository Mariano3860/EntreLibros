import { query } from '../db.js';
import { createBook, type NewBook } from './bookRepository.js';

export type PublicationStatus = 'draft' | 'available' | 'reserved' | 'inactive';
export type PublicationType = 'offer' | 'want';
export type PublicationAvailability = 'public' | 'private';
export type PublicationCondition = 'new' | 'very_good' | 'good' | 'acceptable';
export type PublicationShippingPayer = 'owner' | 'requester' | 'split';

export interface PublicationDelivery {
  nearBookCorner: boolean;
  inPerson: boolean;
  shipping: boolean;
  shippingPayer: PublicationShippingPayer | null;
}

export interface Publication {
  id: number;
  userId: number;
  bookId: number;
  title: string;
  author: string | null;
  coverUrl: string;
  condition: PublicationCondition | null;
  status: PublicationStatus;
  type: PublicationType;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  priceAmount: number | null;
  priceCurrency: string | null;
  tradePreferences: string[];
  notes: string | null;
  availability: PublicationAvailability;
  isDraft: boolean;
  isSeeking: boolean;
  cornerId: string | null;
  delivery: PublicationDelivery;
  metadata: {
    publisher: string | null;
    publishedYear: number | null;
    language: string | null;
    format: string | null;
    isbn: string | null;
    coverUrl: string | null;
  };
}

interface PublicationRow {
  id: number;
  user_id: number;
  book_id: number;
  status: PublicationStatus;
  type: PublicationType;
  condition: PublicationCondition | null;
  description: string | null;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  price_amount: string | null;
  price_currency: string | null;
  trade_preferences: string[] | null;
  availability: PublicationAvailability;
  is_draft: boolean;
  delivery_near_book_corner: boolean;
  delivery_in_person: boolean;
  delivery_shipping: boolean;
  delivery_shipping_payer: PublicationShippingPayer | null;
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
}

export interface PublicationImageInput {
  url: string;
  source?: string | null;
  isPrimary?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface NewPublication {
  userId: number;
  book: NewBook;
  type: PublicationType;
  condition: PublicationCondition | null;
  notes: string | null;
  sale: boolean;
  donation: boolean;
  trade: boolean;
  priceAmount: number | null;
  priceCurrency: string | null;
  tradePreferences: string[];
  availability: PublicationAvailability;
  isDraft: boolean;
  cornerId: string | null;
  delivery: PublicationDelivery;
  images: PublicationImageInput[];
}

const PUBLICATION_SELECT = `
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
    b.title,
    b.author,
    b.publisher,
    b.published_year,
    b.language,
    b.format,
    b.isbn,
    b.cover_url AS book_cover_url,
    img.url AS primary_image_url
  FROM publications p
  JOIN books b ON p.book_id = b.id
  LEFT JOIN LATERAL (
    SELECT url
    FROM publication_images
    WHERE publication_id = p.id
    ORDER BY is_primary DESC, id ASC
    LIMIT 1
  ) img ON true
`;

function mapRow(row: PublicationRow): Publication {
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
  };
}

async function fetchPublications(
  whereClause: string,
  params: unknown[]
): Promise<Publication[]> {
  const { rows } = await query<PublicationRow>(
    `${PUBLICATION_SELECT} ${whereClause} ORDER BY p.created_at DESC`,
    params
  );
  return rows.map(mapRow);
}

async function fetchPublicationById(id: number): Promise<Publication | null> {
  const publications = await fetchPublications('WHERE p.id = $1', [id]);
  return publications[0] ?? null;
}

export async function createPublication(
  publication: NewPublication
): Promise<Publication> {
  const book = await createBook(publication.book);
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
  } = publication;

  const { rows } = await query<{ id: number }>(
    `INSERT INTO publications (
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
    ) RETURNING id`,
    [
      userId,
      book.id,
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

  const publicationId = rows[0].id;

  if (images.length > 0) {
    const prepared = images.map((image, index) => {
      const metadata =
        image.metadata ?? (image.source ? { source: image.source } : null);
      return query(
        `INSERT INTO publication_images (
          publication_id,
          url,
          is_primary,
          source,
          metadata
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          publicationId,
          image.url,
          image.isPrimary ?? index === 0,
          image.source ?? null,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );
    });
    await Promise.all(prepared);
  }

  const created = await fetchPublicationById(publicationId);
  if (!created) {
    throw new Error('Publication creation failed');
  }
  return created;
}

export async function listUserPublications(
  userId: number
): Promise<Publication[]> {
  return fetchPublications('WHERE p.user_id = $1', [userId]);
}

export async function listPublicPublications(): Promise<Publication[]> {
  return fetchPublications(
    "WHERE p.status = 'available' AND p.availability = 'public' AND p.is_draft = false",
    []
  );
}
