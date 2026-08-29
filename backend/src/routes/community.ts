import { Router } from 'express';

import {
  getCommunityActivity,
  getCommunityStats,
  getCommunitySuggestions,
} from '../services/communityStats.js';
import { getCommunityFeed } from '../services/communityFeed.js';
import {
  CornerValidationError,
  getCornersMap,
  listNearbyCorners,
  publishCorner,
  editCorner,
  type PublishCornerPayload,
  type UpdateCornerPayload,
} from '../services/communityCorners.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return parseOptionalNumber(value[0]);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

router.get('/corners/nearby', async (req, res) => {
  const latitude = parseOptionalNumber(req.query.lat);
  const longitude = parseOptionalNumber(req.query.lon);
  const radiusKm = parseOptionalNumber(req.query.radiusKm);
  const limit = parseOptionalNumber(req.query.limit);

  if (
    (req.query.lat !== undefined && latitude === undefined) ||
    (req.query.lon !== undefined && longitude === undefined) ||
    (req.query.radiusKm !== undefined && radiusKm === undefined) ||
    (req.query.limit !== undefined && limit === undefined)
  ) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'community.corners.errors.invalid_coordinates',
    });
  }

  try {
    const corners = await listNearbyCorners({
      latitude,
      longitude,
      radiusKm,
      limit: limit ? Math.floor(limit) : undefined,
    });
    return res.json(corners);
  } catch (error) {
    console.error('Failed to list nearby corners', error);
    return res.status(500).json({
      error: 'CornerQueryFailed',
      message: 'community.corners.errors.query_failed',
    });
  }
});

router.get('/corners/map', async (_req, res) => {
  try {
    const map = await getCornersMap();
    return res.json(map);
  } catch (error) {
    console.error('Failed to load corners map', error);
    return res.status(500).json({
      error: 'CornerMapFailed',
      message: 'community.corners.errors.map_failed',
    });
  }
});

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

    try {
      const payload = req.body as PublishCornerPayload;
      const created = await publishCorner(payload, req.user.id);
      return res.status(201).json(created);
    } catch (error) {
      if (error instanceof CornerValidationError) {
        return res.status(422).json({ errors: error.errors });
      }

      console.error('Failed to publish corner', error);
      return res.status(500).json({
        error: 'CornerCreationFailed',
        message: 'community.corners.errors.create_failed',
      });
    }
  }
);

router.patch(
  '/corners/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    try {
      const updated = await editCorner(
        req.params.id,
        req.user.id,
        req.body as UpdateCornerPayload
      );
      if (!updated)
        return res
          .status(404)
          .json({
            error: 'NotFound',
            message: 'community.corners.errors.not_found',
          });
      return res.json(updated);
    } catch (error) {
      if (error instanceof CornerValidationError)
        return res.status(422).json({ errors: error.errors });
      return res
        .status(500)
        .json({
          error: 'CornerUpdateFailed',
          message: 'community.corners.errors.update_failed',
        });
    }
  }
);

router.get('/stats', (_req, res) => {
  const stats = getCommunityStats();
  res.json(stats);
});

router.get('/feed', (req, res) => {
  const rawPage = req.query.page;
  const rawSize = req.query.size;

  const page = rawPage === undefined ? 0 : Number(rawPage);
  const size = rawSize === undefined ? 8 : Number(rawSize);

  if (
    !Number.isInteger(page) ||
    page < 0 ||
    !Number.isInteger(size) ||
    size <= 0
  ) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'community.errors.invalid_pagination',
    });
  }

  const clampedSize = Math.min(size, 20);
  const feed = getCommunityFeed({ page, size: clampedSize });
  res.json(feed);
});

router.get('/activity', (_req, res) => {
  const activity = getCommunityActivity();
  res.json(activity);
});

router.get('/suggestions', (_req, res) => {
  const suggestions = getCommunitySuggestions();
  res.json(suggestions);
});

export default router;
