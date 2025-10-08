import { Router } from 'express';

import {
  getCommunityActivity,
  getCommunityStats,
  getCommunitySuggestions,
} from '../services/communityStats.js';
import { getCommunityFeed } from '../services/communityFeed.js';

const router = Router();

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
