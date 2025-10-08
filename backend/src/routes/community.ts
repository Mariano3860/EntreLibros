import { Router } from 'express';

import {
  CommunityCornerValidationError,
  getCornersMap,
  getNearbyCorners,
  publishCorner,
} from '../services/communityCorners.js';

const router = Router();

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return undefined;
};

router.get('/corners/nearby', async (req, res) => {
  const latitude = parseOptionalNumber(req.query.latitude ?? req.query.lat);
  const longitude = parseOptionalNumber(req.query.longitude ?? req.query.lon);
  const radiusKm = parseOptionalNumber(req.query.radiusKm ?? req.query.radius);

  const corners = await getNearbyCorners({ latitude, longitude, radiusKm });
  return res.json(corners);
});

router.get('/corners/map', async (_req, res) => {
  const map = await getCornersMap();
  return res.json(map);
});

router.post('/corners', async (req, res) => {
  try {
    const result = await publishCorner(req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof CommunityCornerValidationError) {
      return res.status(422).json({ errors: error.errors });
    }
    console.error('Failed to publish community corner', error);
    return res.status(500).json({
      error: 'UnexpectedError',
      message: 'community.corners.errors.unexpected',
    });
  }
});

export default router;
