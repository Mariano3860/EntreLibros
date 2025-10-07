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
  description: string | null;
  area: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
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
  const nameRaw = raw.name;
  if (typeof nameRaw !== 'string' || nameRaw.trim().length === 0) {
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

  const description =
    typeof raw.description === 'string' && raw.description.trim().length > 0
      ? raw.description.trim()
      : null;

  const areaSource =
    typeof raw.area === 'string'
      ? raw.area
      : typeof raw.zone === 'string'
        ? raw.zone
        : null;
  const area =
    areaSource && areaSource.trim().length > 0 ? areaSource.trim() : null;

  const imageSource =
    typeof raw.imageUrl === 'string'
      ? raw.imageUrl
      : typeof raw.photoUrl === 'string'
        ? raw.photoUrl
        : null;
  const imageUrl =
    imageSource && imageSource.trim().length > 0 ? imageSource.trim() : null;

  const locationRaw = (raw.location ?? {}) as Record<string, unknown>;
  const latitudeCandidate =
    typeof raw.latitude === 'number'
      ? raw.latitude
      : typeof locationRaw.latitude === 'number'
        ? locationRaw.latitude
        : null;
  const longitudeCandidate =
    typeof raw.longitude === 'number'
      ? raw.longitude
      : typeof locationRaw.longitude === 'number'
        ? locationRaw.longitude
        : null;

  if (
    (latitudeCandidate === null && longitudeCandidate !== null) ||
    (latitudeCandidate !== null && longitudeCandidate === null)
  ) {
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

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (latitudeCandidate !== null && longitudeCandidate !== null) {
    if (
      Number.isFinite(latitudeCandidate) &&
      Number.isFinite(longitudeCandidate) &&
      latitudeCandidate >= -90 &&
      latitudeCandidate <= 90 &&
      longitudeCandidate >= -180 &&
      longitudeCandidate <= 180
    ) {
      latitude = latitudeCandidate;
      longitude = longitudeCandidate;
    } else {
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
  }

  return {
    data: {
      name: nameRaw.trim(),
      description,
      area,
      imageUrl,
      latitude,
      longitude,
    },
  };
}

function toPublicCorner(corner: BookCorner) {
  return {
    id: corner.id,
    name: corner.name,
    description: corner.description,
    area: corner.area,
    imageUrl: corner.imageUrl,
    location: corner.location,
    activityStatus: corner.activityStatus,
    approved: corner.approved,
    recentExchangeCount: corner.recentExchangeCount,
    lastActivityAt: corner.lastActivityAt,
    createdAt: corner.createdAt,
    updatedAt: corner.updatedAt,
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
      description: data.description,
      area: data.area,
      imageUrl: data.imageUrl,
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
