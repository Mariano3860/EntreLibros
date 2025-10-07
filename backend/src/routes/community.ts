import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  createBookCorner,
  listApprovedBookCornersNearby,
  listApprovedBookCornersForMap,
  type BookCorner,
} from '../repositories/bookCornerRepository.js';

const DEFAULT_NEARBY_RADIUS_KM = 10;
const MAX_NEARBY_RESULTS = 20;

const router = Router();

interface CreateCornerPayload {
  name: string;
  scope: 'public' | 'semiprivate';
  hostAlias: string;
  internalContact: string;
  rules: string | null;
  schedule: string | null;
  street: string;
  streetNumber: string;
  unit: string | null;
  postalCode: string | null;
  latitude: number;
  longitude: number;
  visibilityPreference: 'exact' | 'approximate';
  consent: boolean;
  photoUrl: string | null;
  status: 'active' | 'paused';
  themes: string[];
  area: string | null;
  city: string | null;
}

function parseCreateCornerPayload(
  body: unknown
):
  | { data: CreateCornerPayload }
  | { error: { status: number; payload: { error: string; message: string } } } {
  if (typeof body !== 'object' || body === null) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'InvalidPayload',
          message: 'community.corners.errors.invalid_payload',
        },
      },
    };
  }

  const raw = body as Record<string, unknown>;

  const asTrimmedString = (value: unknown): string | null => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const name = asTrimmedString(raw.name);
  if (!name) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'MissingFields',
          message: 'community.corners.errors.name_required',
        },
      },
    };
  }

  const scopeRaw = asTrimmedString(raw.scope);
  const scope: CreateCornerPayload['scope'] =
    scopeRaw === 'public' || scopeRaw === 'semiprivate' ? scopeRaw : 'public';

  const hostAlias = asTrimmedString(raw.hostAlias);
  const internalContact = asTrimmedString(raw.internalContact);

  if (!hostAlias || !internalContact) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'InvalidFields',
          message: 'community.corners.errors.invalid_payload',
        },
      },
    };
  }

  const rules = asTrimmedString(raw.rules);
  const schedule = asTrimmedString(raw.schedule);

  const locationRaw = raw.location as Record<string, unknown> | undefined;
  const addressRaw =
    (locationRaw?.address as Record<string, unknown> | undefined) ?? undefined;
  const coordinatesRaw =
    (locationRaw?.coordinates as Record<string, unknown> | undefined) ??
    (locationRaw as Record<string, unknown> | undefined);

  const street = addressRaw ? asTrimmedString(addressRaw.street) : null;
  const streetNumber = addressRaw ? asTrimmedString(addressRaw.number) : null;
  const unit = addressRaw ? asTrimmedString(addressRaw.unit) : null;
  const postalCode = addressRaw ? asTrimmedString(addressRaw.postalCode) : null;

  if (!street || !streetNumber) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'InvalidAddress',
          message: 'community.corners.errors.invalid_payload',
        },
      },
    };
  }

  const latitudeRaw = coordinatesRaw?.latitude ?? raw.latitude;
  const longitudeRaw = coordinatesRaw?.longitude ?? raw.longitude;

  if (latitudeRaw === undefined || longitudeRaw === undefined) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'InvalidFields',
          message: 'community.corners.errors.incomplete_location',
        },
      },
    };
  }

  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'InvalidFields',
          message: 'community.corners.errors.invalid_location',
        },
      },
    };
  }

  const visibilityPreferenceRaw = asTrimmedString(
    locationRaw?.visibilityPreference
  );
  const visibilityPreference: CreateCornerPayload['visibilityPreference'] =
    visibilityPreferenceRaw === 'approximate' ? 'approximate' : 'exact';

  const consentValue = raw.consent;
  const consent = typeof consentValue === 'boolean' ? consentValue : false;
  if (!consent) {
    return {
      error: {
        status: 400,
        payload: {
          error: 'ConsentRequired',
          message: 'community.corners.errors.invalid_payload',
        },
      },
    };
  }

  const photoRaw = raw.photo as Record<string, unknown> | undefined;
  const photoUrl =
    asTrimmedString(photoRaw?.url) ?? asTrimmedString(raw.imageUrl);

  const statusRaw = asTrimmedString(raw.status);
  const status: CreateCornerPayload['status'] =
    statusRaw === 'paused' ? 'paused' : 'active';

  const themesRaw = Array.isArray(raw.themes) ? raw.themes : [];
  const themes = themesRaw
    .map((theme) => asTrimmedString(theme))
    .filter((theme): theme is string => Boolean(theme));

  const area = asTrimmedString(raw.area) ?? asTrimmedString(raw.neighborhood);
  const city = asTrimmedString(raw.city);

  return {
    data: {
      name,
      scope,
      hostAlias,
      internalContact,
      rules,
      schedule,
      street,
      streetNumber,
      unit,
      postalCode,
      latitude,
      longitude,
      visibilityPreference,
      consent,
      photoUrl,
      status,
      themes,
      area,
      city,
    },
  };
}

function toPublicCorner(corner: BookCorner) {
  return {
    id: corner.id,
    name: corner.name,
    description: corner.description,
    area: corner.area,
    neighborhood: corner.neighborhood,
    city: corner.city,
    street: corner.street,
    streetNumber: corner.streetNumber,
    unit: corner.unit,
    postalCode: corner.postalCode,
    imageUrl: corner.imageUrl,
    location: corner.location,
    activityStatus: corner.activityStatus,
    approved: corner.approved,
    recentExchangeCount: corner.recentExchangeCount,
    lastActivityAt: corner.lastActivityAt,
    createdAt: corner.createdAt,
    updatedAt: corner.updatedAt,
    referencePointLabel: corner.referencePointLabel,
    schedule: corner.schedule,
    rules: corner.rules,
    isOpenNow: corner.isOpenNow,
    themes: corner.themes,
    scope: corner.scope,
    hostAlias: corner.hostAlias,
    internalContact: corner.internalContact,
    visibilityPreference: corner.visibilityPreference,
    consent: corner.consent,
    status: corner.status,
  };
}

router.post(
  '/corners',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }

    const parsed = parseCreateCornerPayload(req.body);
    if ('error' in parsed) {
      return res.status(parsed.error.status).json(parsed.error.payload);
    }

    const { data } = parsed;
    const corner = await createBookCorner({
      name: data.name,
      description: data.rules,
      rules: data.rules,
      schedule: data.schedule,
      area: data.area,
      neighborhood: data.area,
      city: data.city,
      street: data.street,
      streetNumber: data.streetNumber,
      unit: data.unit,
      postalCode: data.postalCode,
      visibilityPreference: data.visibilityPreference,
      consent: data.consent,
      scope: data.scope,
      hostAlias: data.hostAlias,
      internalContact: data.internalContact,
      status: data.status,
      isOpenNow: data.status === 'active',
      themes: data.themes,
      imageUrl: data.photoUrl,
      photoUrls: data.photoUrl ? [data.photoUrl] : [],
      latitude: data.latitude,
      longitude: data.longitude,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      ...toPublicCorner(corner),
      status: corner.approved ? 'approved' : 'pending',
    });
  }
);

router.get(
  '/corners/nearby',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }

    if (!req.user.location) {
      return res.status(400).json({
        error: 'LocationRequired',
        message: 'community.corners.errors.location_required',
      });
    }

    const radiusKm =
      typeof req.user.searchRadius === 'number' && req.user.searchRadius > 0
        ? req.user.searchRadius
        : DEFAULT_NEARBY_RADIUS_KM;

    const corners = await listApprovedBookCornersNearby({
      latitude: req.user.location.latitude,
      longitude: req.user.location.longitude,
      radiusKm,
      limit: MAX_NEARBY_RESULTS,
    });

    return res.json(
      corners.map((corner) => ({
        ...toPublicCorner(corner),
        distanceKm:
          corner.distanceMeters !== null
            ? Number((corner.distanceMeters / 1000).toFixed(2))
            : null,
        radiusKm,
      }))
    );
  }
);

router.get('/corners/map', async (_req, res) => {
  const corners = await listApprovedBookCornersForMap();
  return res.json({
    introKey: 'community.corners.map.description.default',
    intro: 'Explora los Rincones de Libros activos en el mapa comunitario.',
    pins: corners.map((corner) => ({
      ...toPublicCorner(corner),
    })),
  });
});

export default router;
