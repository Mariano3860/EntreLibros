import { Router } from 'express';

import {
  CommunityCornerValidationError,
  getCornersMap,
  getNearbyCorners,
  publishCorner,
} from '../services/communityCorners.js';
import { getCommunityFeed } from '../services/communityFeed.js';
import {
  getCommunityActivity,
  getCommunityStats,
  getCommunitySuggestions,
} from '../services/communityStats.js';

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
