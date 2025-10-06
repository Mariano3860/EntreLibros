import { Router } from 'express';
import { verifyBook } from '../repositories/bookRepository.js';
import {
  createPublication,
  listPublicPublications,
  listUserPublications,
  type Publication,
  type PublicationDelivery,
  type PublicationCondition,
  type PublicationType,
  type PublicationAvailability,
  type PublicationShippingPayer,
} from '../repositories/publicationRepository.js';
import {
  searchBooks as searchExternalBooks,
  checkBookExists,
} from '../services/openLibrary.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const publications = await listPublicPublications();
  res.json(publications.map(toPublicPublication));
});

router.get('/search', async (req, res) => {
  const q = req.query.q as string | undefined;
  if (!q) {
    return res.status(400).json({
      error: 'MissingFields',
      message: 'books.errors.q_required',
    });
  }
  try {
    const books = await searchExternalBooks(q);
    res.json(books);
  } catch {
    res.status(502).json({
      error: 'SearchFailed',
      message: 'books.errors.search_failed',
    });
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

  const verified = await checkBookExists({
    title: metadata.title,
    author: metadata.author ?? undefined,
    isbn: metadata.isbn ?? undefined,
  });

  const publication = await createPublication({
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

  res.status(201).json(toUserPublication(publication));
});

router.get('/mine', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
  const publications = await listUserPublications(req.user.id);
  res.json(publications.map(toUserPublication));
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
    condition: PublicationCondition;
    tradePreferences: string[];
    notes: string | null;
    availability: PublicationAvailability;
    delivery: PublicationDelivery;
  };
  draft: boolean;
  type: PublicationType;
  cornerId: string | null;
};

const ALLOWED_CONDITIONS: readonly PublicationCondition[] = [
  'new',
  'very_good',
  'good',
  'acceptable',
];
const ALLOWED_AVAILABILITIES: readonly PublicationAvailability[] = [
  'public',
  'private',
];
const ALLOWED_TYPES: readonly PublicationType[] = ['offer', 'want'];
const ALLOWED_SHIPPING_PAYERS: readonly PublicationShippingPayer[] = [
  'owner',
  'requester',
  'split',
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

function toUserPublication(publication: Publication) {
  const displayStatus =
    publication.status === 'draft' ? 'available' : publication.status;
  return {
    id: String(publication.id),
    title: publication.title,
    author: publication.author ?? '',
    coverUrl: publication.coverUrl,
    condition: publication.condition ?? undefined,
    status: displayStatus,
    publicationStatus: publication.status,
    isForSale: publication.sale,
    price: publication.sale ? publication.priceAmount : null,
    priceCurrency: publication.sale ? publication.priceCurrency : null,
    isForTrade: publication.trade,
    tradePreferences: publication.tradePreferences,
    isSeeking: publication.isSeeking,
    isForDonation: publication.donation,
    availability: publication.availability,
    delivery: publication.delivery,
    notes: publication.notes ?? undefined,
    cornerId: publication.cornerId ?? undefined,
    publisher: publication.metadata.publisher ?? undefined,
    year: publication.metadata.publishedYear ?? undefined,
    language: publication.metadata.language ?? undefined,
    format: publication.metadata.format ?? undefined,
    isbn: publication.metadata.isbn ?? undefined,
    draft: publication.isDraft,
    type: publication.type,
  };
}

function toPublicPublication(publication: Publication) {
  const displayStatus =
    publication.status === 'draft' ? 'available' : publication.status;
  return {
    id: String(publication.id),
    title: publication.title,
    author: publication.author ?? '',
    coverUrl: publication.coverUrl,
    condition: publication.condition ?? undefined,
    status: displayStatus,
    publicationStatus: publication.status,
    type: publication.type,
    isForSale: publication.sale,
    price: publication.sale ? publication.priceAmount : null,
    priceCurrency: publication.sale ? publication.priceCurrency : null,
    isForTrade: publication.trade,
    isSeeking: publication.isSeeking,
    isForDonation: publication.donation,
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
  if (!ALLOWED_CONDITIONS.includes(conditionRaw as PublicationCondition)) {
    return {
      status: 400,
      error: {
        error: 'InvalidFields',
        message: 'books.errors.invalid_condition',
      },
    };
  }
  const condition = conditionRaw as PublicationCondition;

  const tradePreferencesRaw = offerRaw.tradePreferences;
  const tradePreferences: string[] = Array.isArray(tradePreferencesRaw)
    ? tradePreferencesRaw
        .map((value) => optionalString(value))
        .filter((value): value is string => value !== null)
    : [];

  const notes = optionalString(offerRaw.notes);

  const availabilityRaw = optionalString(offerRaw.availability) ?? 'public';
  if (
    !ALLOWED_AVAILABILITIES.includes(availabilityRaw as PublicationAvailability)
  ) {
    return {
      status: 400,
      error: {
        error: 'InvalidFields',
        message: 'books.errors.invalid_availability',
      },
    };
  }
  const availability = availabilityRaw as PublicationAvailability;

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
  let shippingPayer: PublicationShippingPayer | null = null;
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
        deliveryRaw.shippingPayer as PublicationShippingPayer
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
    shippingPayer = deliveryRaw.shippingPayer as PublicationShippingPayer;
  } else if (
    typeof deliveryRaw.shippingPayer === 'string' &&
    ALLOWED_SHIPPING_PAYERS.includes(
      deliveryRaw.shippingPayer as PublicationShippingPayer
    )
  ) {
    shippingPayer = deliveryRaw.shippingPayer as PublicationShippingPayer;
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

  let type: PublicationType = 'offer';
  if (typeof body.type === 'string') {
    const normalized = body.type.trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(normalized as PublicationType)) {
      return {
        status: 400,
        error: {
          error: 'InvalidFields',
          message: 'books.errors.invalid_type',
        },
      };
    }
    type = normalized as PublicationType;
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
