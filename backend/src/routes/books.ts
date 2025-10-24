import { Router, type Request } from 'express';
import { verifyBook } from '../repositories/bookRepository.js';
import {
  createBookListing,
  listPublicBookListings,
  listUserBookListings,
  type BookListing,
  type BookListingDelivery,
  type BookListingCondition,
  type BookListingType,
  type BookListingAvailability,
  type BookListingShippingPayer,
} from '../repositories/bookListingRepository.js';
import {
  searchBooksApiResults,
  checkBookExists,
} from '../services/openLibrary.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import jwt, { type Algorithm } from 'jsonwebtoken';
import {
  getPublicationById,
  updatePublication,
  type PublicationUpdateInput,
  type PublicationStatus,
  type PublicationImageUpdate,
} from '../services/bookListings.js';

const router = Router();

router.get('/', async (_req, res) => {
  const listings = await listPublicBookListings();
  res.json(listings.map(toPublicBookListing));
});

router.get('/search', async (req, res) => {
  try {
    const raw = (req.query.q ?? req.query.query ?? '') as string | string[];
    const val = Array.isArray(raw) ? raw[0] : raw;
    const q = (val ?? '').toString().trim();

    if (!q) {
      return res.status(400).json({
        error: 'q_required',
        message: 'Missing q (or query) parameter',
      });
    }

    const results = await searchBooksApiResults(q);
    return res.json(results);
  } catch (e) {
    return res.status(502).json({ error: `openlibrary_error: ${String(e)}` });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }

  const validation = validatePublishRequest(req.body);
  if ('error' in validation) {
    return res.status(validation.status).json(validation.error);
  }

  const { metadata, images, offer, draft, type, cornerId } = validation.data;

  let verified: boolean;
  try {
    verified = await checkBookExists({
      isbn: metadata.isbn || undefined,
      title: metadata.title || undefined,
      author: metadata.author || undefined,
    });
  } catch {
    verified = false;
  }

  const listing = await createBookListing({
    userId: req.user.id,
    book: {
      title: metadata.title,
      author: metadata.author,
      isbn: metadata.isbn,
      publisher: metadata.publisher,
      publishedYear: metadata.year,
      verified,
      language: metadata.language,
      format: metadata.format,
      coverUrl: metadata.coverUrl,
    },
    type,
    condition: offer.condition,
    notes: offer.notes,
    sale: offer.sale,
    donation: offer.donation,
    trade: offer.trade,
    priceAmount: offer.priceAmount,
    priceCurrency: offer.priceCurrency,
    tradePreferences: offer.tradePreferences,
    availability: offer.availability,
    isDraft: draft,
    cornerId,
    delivery: offer.delivery,
    images: images.map((image, index) => ({
      url: image.url,
      source: image.source,
      isPrimary: image.isPrimary ?? index === 0,
    })),
  });

  res.status(201).json(toUserBookListing(listing));
});

router.get('/mine', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
  const listings = await listUserBookListings(req.user.id);
  res.json(listings.map(toUserBookListing));
});

router.post('/:id/verify', async (req, res) => {
  const id = Number(req.params.id);
  const book = await verifyBook(id);
  if (!book) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }
  res.json(book);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }

  const viewerId = await getOptionalViewerId(req);
  const publication = await getPublicationById(id, viewerId);
  if (!publication) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }

  return res.json(publication);
});

router.put('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }

  const validation = validatePublicationUpdate(req.body);
  if ('error' in validation) {
    return res.status(validation.status).json(validation.error);
  }

  const result = await updatePublication(id, req.user.id, validation.data);

  if (result.kind === 'not_found') {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }

  if (result.kind === 'forbidden') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'books.errors.not_owner',
    });
  }

  return res.json(result.publication);
});

type ValidationError = {
  status: number;
  error: { error: string; message: string };
};

type ValidatedPublishData = {
  metadata: {
    title: string;
    author: string | null;
    publisher: string | null;
    year: number | null;
    language: string | null;
    format: string | null;
    isbn: string | null;
    coverUrl: string | null;
  };
  images: Array<{ url: string; source: string | null; isPrimary?: boolean }>;
  offer: {
    sale: boolean;
    donation: boolean;
    trade: boolean;
    priceAmount: number | null;
    priceCurrency: string | null;
    condition: BookListingCondition;
    tradePreferences: string[];
    notes: string | null;
    availability: BookListingAvailability;
    delivery: BookListingDelivery;
  };
  draft: boolean;
  type: BookListingType;
  cornerId: string | null;
};

const ALLOWED_CONDITIONS: readonly BookListingCondition[] = [
  'new',
  'very_good',
  'good',
  'acceptable',
];
const ALLOWED_AVAILABILITIES: readonly BookListingAvailability[] = [
  'public',
  'private',
];
const ALLOWED_TYPES: readonly BookListingType[] = ['offer', 'want'];
const ALLOWED_SHIPPING_PAYERS: readonly BookListingShippingPayer[] = [
  'owner',
  'requester',
  'split',
];
const ALLOWED_PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'available',
  'reserved',
  'completed',
  'draft',
];
const ALLOWED_IMAGE_SOURCES: readonly PublicationImageUpdate['source'][] = [
  'cover',
  'upload',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getOptionalViewerId(req: Request): Promise<number | undefined> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return undefined;
  }
  const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
  const token = parseCookies(req.headers.cookie).sessionToken;
  if (!token) {
    return undefined;
  }
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: [jwtAlgorithm],
    }) as { id: number };
    return typeof payload.id === 'number' ? payload.id : undefined;
  } catch {
    return undefined;
  }
}

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.trim().split('=');
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function invalidUpdateError(): ValidationError {
  return {
    status: 400,
    error: { error: 'InvalidFields', message: 'books.errors.invalid_update' },
  };
}

function validatePublicationUpdate(
  body: unknown
): { data: PublicationUpdateInput } | ValidationError {
  if (!isRecord(body)) {
    return invalidUpdateError();
  }

  const data: PublicationUpdateInput = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      return invalidUpdateError();
    }
    const title = body.title.trim();
    if (title.length === 0) {
      return invalidUpdateError();
    }
    data.title = title;
  }

  if (body.author !== undefined) {
    if (body.author === null) {
      data.author = null;
    } else if (typeof body.author === 'string') {
      data.author = body.author.trim().length > 0 ? body.author.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.publisher !== undefined) {
    if (body.publisher === null) {
      data.publisher = null;
    } else if (typeof body.publisher === 'string') {
      data.publisher =
        body.publisher.trim().length > 0 ? body.publisher.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.language !== undefined) {
    if (body.language === null) {
      data.language = null;
    } else if (typeof body.language === 'string') {
      data.language =
        body.language.trim().length > 0 ? body.language.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.format !== undefined) {
    if (body.format === null) {
      data.format = null;
    } else if (typeof body.format === 'string') {
      data.format = body.format.trim().length > 0 ? body.format.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.isbn !== undefined) {
    if (body.isbn === null) {
      data.isbn = null;
    } else if (typeof body.isbn === 'string') {
      data.isbn = body.isbn.trim().length > 0 ? body.isbn.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.year !== undefined) {
    if (body.year === null) {
      data.year = null;
    } else if (typeof body.year === 'number' && Number.isFinite(body.year)) {
      data.year = Math.trunc(body.year);
    } else if (typeof body.year === 'string') {
      const parsed = Number(body.year);
      if (!Number.isFinite(parsed)) {
        return invalidUpdateError();
      }
      data.year = Math.trunc(parsed);
    } else {
      return invalidUpdateError();
    }
  }

  if (body.condition !== undefined) {
    if (typeof body.condition !== 'string') {
      return invalidUpdateError();
    }
    if (!ALLOWED_CONDITIONS.includes(body.condition as BookListingCondition)) {
      return invalidUpdateError();
    }
    data.condition = body.condition as BookListingCondition;
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string') {
      return invalidUpdateError();
    }
    if (
      !ALLOWED_PUBLICATION_STATUSES.includes(body.status as PublicationStatus)
    ) {
      return invalidUpdateError();
    }
    data.status = body.status as PublicationStatus;
  }

  if (body.notes !== undefined) {
    if (body.notes === null) {
      data.notes = null;
    } else if (typeof body.notes === 'string') {
      data.notes = body.notes.trim().length > 0 ? body.notes.trim() : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.cornerId !== undefined) {
    if (body.cornerId === null) {
      data.cornerId = null;
    } else if (typeof body.cornerId === 'string') {
      const corner = body.cornerId.trim();
      data.cornerId = corner.length > 0 ? corner : null;
    } else {
      return invalidUpdateError();
    }
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return invalidUpdateError();
    }
    const images: PublicationImageUpdate[] = [];
    for (const entry of body.images) {
      if (!isRecord(entry)) {
        return invalidUpdateError();
      }
      const url = optionalString(entry.url);
      if (!url) {
        return invalidUpdateError();
      }
      const sourceRaw = typeof entry.source === 'string' ? entry.source : '';
      const source = sourceRaw.trim().toLowerCase();
      if (
        !ALLOWED_IMAGE_SOURCES.includes(
          source as PublicationImageUpdate['source']
        )
      ) {
        return invalidUpdateError();
      }
      const image: PublicationImageUpdate = {
        url,
        source: source as PublicationImageUpdate['source'],
      };
      if (entry.isPrimary !== undefined) {
        if (typeof entry.isPrimary !== 'boolean') {
          return invalidUpdateError();
        }
        image.isPrimary = entry.isPrimary;
      }
      images.push(image);
    }
    data.images = images;
  }

  if (body.offer !== undefined) {
    if (!isRecord(body.offer)) {
      return invalidUpdateError();
    }
    const offerData: NonNullable<PublicationUpdateInput['offer']> = {};
    const offerRaw = body.offer as Record<string, unknown>;

    if (offerRaw.sale !== undefined) {
      if (typeof offerRaw.sale !== 'boolean') {
        return invalidUpdateError();
      }
      offerData.sale = offerRaw.sale;
    }

    if (offerRaw.donation !== undefined) {
      if (typeof offerRaw.donation !== 'boolean') {
        return invalidUpdateError();
      }
      offerData.donation = offerRaw.donation;
    }

    if (offerRaw.trade !== undefined) {
      if (typeof offerRaw.trade !== 'boolean') {
        return invalidUpdateError();
      }
      offerData.trade = offerRaw.trade;
    }

    if (offerRaw.price !== undefined) {
      if (offerRaw.price === null) {
        offerData.price = null;
      } else if (isRecord(offerRaw.price)) {
        const priceRecord = offerRaw.price as Record<string, unknown>;
        const amount = priceRecord.amount;
        const currencyRaw = priceRecord.currency;
        if (
          typeof amount !== 'number' ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return invalidUpdateError();
        }
        if (
          typeof currencyRaw !== 'string' ||
          currencyRaw.trim().length === 0
        ) {
          return invalidUpdateError();
        }
        offerData.price = {
          amount,
          currency: currencyRaw.trim().toUpperCase(),
        };
      } else {
        return invalidUpdateError();
      }
    }

    if (offerRaw.tradePreferences !== undefined) {
      if (!Array.isArray(offerRaw.tradePreferences)) {
        return invalidUpdateError();
      }
      const preferences: string[] = [];
      for (const pref of offerRaw.tradePreferences) {
        const value = optionalString(pref);
        if (value) {
          preferences.push(value);
        }
      }
      offerData.tradePreferences = preferences;
    }

    if (offerRaw.availability !== undefined) {
      if (typeof offerRaw.availability !== 'string') {
        return invalidUpdateError();
      }
      if (
        !ALLOWED_AVAILABILITIES.includes(
          offerRaw.availability as BookListingAvailability
        )
      ) {
        return invalidUpdateError();
      }
      offerData.availability = offerRaw.availability as BookListingAvailability;
    }

    if (offerRaw.delivery !== undefined) {
      if (!isRecord(offerRaw.delivery)) {
        return invalidUpdateError();
      }
      const deliveryRecord = offerRaw.delivery as Record<string, unknown>;
      const delivery: NonNullable<
        NonNullable<PublicationUpdateInput['offer']>['delivery']
      > = {};
      if (deliveryRecord.nearBookCorner !== undefined) {
        if (typeof deliveryRecord.nearBookCorner !== 'boolean') {
          return invalidUpdateError();
        }
        delivery.nearBookCorner = deliveryRecord.nearBookCorner;
      }
      if (deliveryRecord.inPerson !== undefined) {
        if (typeof deliveryRecord.inPerson !== 'boolean') {
          return invalidUpdateError();
        }
        delivery.inPerson = deliveryRecord.inPerson;
      }
      if (deliveryRecord.shipping !== undefined) {
        if (typeof deliveryRecord.shipping !== 'boolean') {
          return invalidUpdateError();
        }
        delivery.shipping = deliveryRecord.shipping;
      }
      if (deliveryRecord.shippingPayer !== undefined) {
        if (deliveryRecord.shippingPayer === null) {
          delivery.shippingPayer = null;
        } else if (typeof deliveryRecord.shippingPayer === 'string') {
          if (
            !ALLOWED_SHIPPING_PAYERS.includes(
              deliveryRecord.shippingPayer as BookListingShippingPayer
            )
          ) {
            return invalidUpdateError();
          }
          delivery.shippingPayer =
            deliveryRecord.shippingPayer as BookListingShippingPayer;
        } else {
          return invalidUpdateError();
        }
      }
      if (Object.keys(delivery).length > 0) {
        offerData.delivery = delivery;
      }
    }

    if (Object.keys(offerData).length > 0) {
      data.offer = offerData;
    }
  }

  return { data };
}

function toUserBookListing(listing: BookListing) {
  return {
    id: String(listing.id),
    title: listing.title,
    author: listing.author ?? '',
    coverUrl: listing.coverUrl,
    condition: listing.condition ?? undefined,
    status: listing.status,
    bookListingStatus: listing.status,
    isForSale: listing.sale,
    price: listing.sale ? listing.priceAmount : null,
    priceCurrency: listing.sale ? listing.priceCurrency : null,
    isForTrade: listing.trade,
    tradePreferences: listing.tradePreferences,
    isSeeking: listing.isSeeking,
    isForDonation: listing.donation,
    availability: listing.availability,
    delivery: listing.delivery,
    notes: listing.notes ?? undefined,
    cornerId: listing.cornerId ?? undefined,
    publisher: listing.metadata.publisher ?? undefined,
    year: listing.metadata.publishedYear ?? undefined,
    language: listing.metadata.language ?? undefined,
    format: listing.metadata.format ?? undefined,
    isbn: listing.metadata.isbn ?? undefined,
    draft: listing.isDraft,
    type: listing.type,
  };
}

function toPublicBookListing(listing: BookListing) {
  return {
    id: String(listing.id),
    title: listing.title,
    author: listing.author ?? '',
    coverUrl: listing.coverUrl,
    condition: listing.condition ?? undefined,
    status: listing.status,
    bookListingStatus: listing.status,
    type: listing.type,
    isForSale: listing.sale,
    price: listing.sale ? listing.priceAmount : null,
    priceCurrency: listing.sale ? listing.priceCurrency : null,
    isForTrade: listing.trade,
    isSeeking: listing.isSeeking,
    isForDonation: listing.donation,
  };
}

function validatePublishRequest(
  body: unknown
): { data: ValidatedPublishData } | ValidationError {
  if (!isRecord(body)) {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.metadata_required',
      },
    };
  }

  const metadataRaw = body.metadata;
  if (!isRecord(metadataRaw)) {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.metadata_required',
      },
    };
  }

  const title = optionalString(metadataRaw.title);
  if (!title) {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.metadata_title_required',
      },
    };
  }

  const author = optionalString(metadataRaw.author);
  const publisher = optionalString(metadataRaw.publisher);
  const language = optionalString(metadataRaw.language);
  const format = optionalString(metadataRaw.format);
  const isbn = optionalString(metadataRaw.isbn);
  let coverUrl = optionalString(metadataRaw.coverUrl);

  const rawYear = metadataRaw.year ?? metadataRaw.publishedYear;
  let year: number | null = null;
  if (typeof rawYear === 'number' && Number.isFinite(rawYear)) {
    year = Math.trunc(rawYear);
  } else if (typeof rawYear === 'string') {
    const parsed = Number(rawYear);
    if (Number.isFinite(parsed)) {
      year = Math.trunc(parsed);
    }
  }

  const imagesRaw = body.images;
  const images: Array<{
    url: string;
    source: string | null;
    isPrimary?: boolean;
  }> = [];
  if (imagesRaw !== undefined) {
    if (!Array.isArray(imagesRaw)) {
      return {
        status: 400,
        error: {
          error: 'InvalidFields',
          message: 'books.errors.invalid_image',
        },
      };
    }
    for (const entry of imagesRaw) {
      if (!isRecord(entry)) {
        return {
          status: 400,
          error: {
            error: 'InvalidFields',
            message: 'books.errors.invalid_image',
          },
        };
      }
      const url = optionalString(entry.url);
      if (!url) {
        return {
          status: 400,
          error: {
            error: 'InvalidFields',
            message: 'books.errors.invalid_image',
          },
        };
      }
      const source = optionalString(entry.source);
      const isPrimary =
        typeof entry.isPrimary === 'boolean' ? entry.isPrimary : undefined;
      images.push({ url, source, isPrimary });
    }
  }

  if (!coverUrl && images.length > 0) {
    coverUrl = images[0].url;
  }

  const offerRaw = body.offer;
  if (!isRecord(offerRaw)) {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.offer_required',
      },
    };
  }

  const sale = offerRaw.sale === true;
  const donation = offerRaw.donation === true;
  const trade = offerRaw.trade === true;
  if (!sale && !donation && !trade) {
    return {
      status: 400,
      error: {
        error: 'InvalidFields',
        message: 'books.errors.offer_modes_required',
      },
    };
  }

  const conditionRaw = offerRaw.condition;
  if (typeof conditionRaw !== 'string') {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.condition_required',
      },
    };
  }
  if (!ALLOWED_CONDITIONS.includes(conditionRaw as BookListingCondition)) {
    return {
      status: 400,
      error: {
        error: 'InvalidFields',
        message: 'books.errors.invalid_condition',
      },
    };
  }
  const condition = conditionRaw as BookListingCondition;

  const tradePreferencesRaw = offerRaw.tradePreferences;
  const tradePreferences: string[] = Array.isArray(tradePreferencesRaw)
    ? tradePreferencesRaw
        .map((value) => optionalString(value))
        .filter((value): value is string => value !== null)
    : [];

  const notes = optionalString(offerRaw.notes);

  const availabilityRaw = optionalString(offerRaw.availability) ?? 'public';
  if (
    !ALLOWED_AVAILABILITIES.includes(availabilityRaw as BookListingAvailability)
  ) {
    return {
      status: 400,
      error: {
        error: 'InvalidFields',
        message: 'books.errors.invalid_availability',
      },
    };
  }
  const availability = availabilityRaw as BookListingAvailability;

  const deliveryRaw = offerRaw.delivery;
  if (!isRecord(deliveryRaw)) {
    return {
      status: 400,
      error: {
        error: 'MissingFields',
        message: 'books.errors.delivery_required',
      },
    };
  }

  const nearBookCorner = deliveryRaw.nearBookCorner === true;
  const inPerson = deliveryRaw.inPerson === true;
  const shipping = deliveryRaw.shipping === true;
  let shippingPayer: BookListingShippingPayer | null = null;
  if (shipping) {
    if (typeof deliveryRaw.shippingPayer !== 'string') {
      return {
        status: 400,
        error: {
          error: 'MissingFields',
          message: 'books.errors.shipping_payer_required',
        },
      };
    }
    if (
      !ALLOWED_SHIPPING_PAYERS.includes(
        deliveryRaw.shippingPayer as BookListingShippingPayer
      )
    ) {
      return {
        status: 400,
        error: {
          error: 'InvalidFields',
          message: 'books.errors.invalid_shipping_payer',
        },
      };
    }
    shippingPayer = deliveryRaw.shippingPayer as BookListingShippingPayer;
  } else if (
    typeof deliveryRaw.shippingPayer === 'string' &&
    ALLOWED_SHIPPING_PAYERS.includes(
      deliveryRaw.shippingPayer as BookListingShippingPayer
    )
  ) {
    shippingPayer = deliveryRaw.shippingPayer as BookListingShippingPayer;
  }

  let priceAmount: number | null = null;
  let priceCurrency: string | null = null;
  if (sale) {
    if (!isRecord(offerRaw.price)) {
      return {
        status: 400,
        error: {
          error: 'MissingFields',
          message: 'books.errors.price_required',
        },
      };
    }
    const amount = offerRaw.price.amount;
    const currency = offerRaw.price.currency;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return {
        status: 400,
        error: {
          error: 'InvalidFields',
          message: 'books.errors.invalid_price',
        },
      };
    }
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return {
        status: 400,
        error: {
          error: 'MissingFields',
          message: 'books.errors.price_required',
        },
      };
    }
    priceAmount = Number(amount);
    priceCurrency = currency.trim().toUpperCase();
  }

  const draft = typeof body.draft === 'boolean' ? body.draft : false;

  let type: BookListingType = 'offer';
  if (typeof body.type === 'string') {
    const normalized = body.type.trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(normalized as BookListingType)) {
      return {
        status: 400,
        error: {
          error: 'InvalidFields',
          message: 'books.errors.invalid_type',
        },
      };
    }
    type = normalized as BookListingType;
  }

  const cornerId = optionalString(body.cornerId) ?? null;

  return {
    data: {
      metadata: {
        title,
        author,
        publisher,
        year,
        language,
        format,
        isbn,
        coverUrl,
      },
      images,
      offer: {
        sale,
        donation,
        trade,
        priceAmount,
        priceCurrency,
        condition,
        tradePreferences,
        notes,
        availability,
        delivery: {
          nearBookCorner,
          inPerson,
          shipping,
          shippingPayer,
        },
      },
      draft,
      type,
      cornerId,
    },
  };
}

export default router;
