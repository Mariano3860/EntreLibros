import { Router, type Response } from 'express';

import {
  getPersistedCommunityActivity,
  getPersistedCommunityFeed,
  getPersistedCommunityStats,
  getPersistedCommunitySuggestions,
} from '../services/communityPersistence.js';
import { getCommunityDiscovery } from '../services/communityDiscovery.js';
import {
  CornerValidationError,
  getCornersMap,
  getPublicCornerDetail,
  listNearbyCorners,
  publishCorner,
  editCorner,
  updateCornerEditorialStatus,
  type PublishCornerEditorialStatus,
  type PublishCornerPayload,
  type UpdateCornerPayload,
} from '../services/communityCorners.js';
import {
  authenticate,
  authenticateOptional,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import { createCommunityStory } from '../repositories/communityStoryRepository.js';
import {
  createCommunityComment,
  isVisibleCommunityPost,
  listCommunityComments,
  parseCommunityPostId,
  toggleCommunityPostLike,
} from '../repositories/communitySocialRepository.js';
import {
  followUser,
  unfollowUser,
} from '../repositories/userFollowRepository.js';
import { findUserById, hasUserBlock } from '../repositories/userRepository.js';

const router = Router();

const CORNER_EDITORIAL_STATUSES: readonly PublishCornerEditorialStatus[] = [
  'pending',
  'needs_correction',
  'approved',
  'rejected',
];

const parseUserId = (value: string | undefined): number | null => {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const invalidFollowTarget = (res: Response) =>
  res.status(404).json({
    error: 'NotFound',
    message: 'community.follow.errors.target_not_found',
  });

async function validateFollowTarget(
  req: AuthenticatedRequest,
  res: Response
): Promise<number | null> {
  const targetId = parseUserId(req.params.id);
  if (!targetId || !req.user || targetId === req.user.id) {
    res.status(targetId === req.user?.id ? 422 : 404).json({
      error: targetId === req.user?.id ? 'InvalidTarget' : 'NotFound',
      message:
        targetId === req.user?.id
          ? 'community.follow.errors.self'
          : 'community.follow.errors.target_not_found',
    });
    return null;
  }
  const target = await findUserById(targetId);
  if (
    !target ||
    target.role === 'bot' ||
    target.profileVisibility === 'private' ||
    (await hasUserBlock(req.user.id, targetId)) ||
    (await hasUserBlock(targetId, req.user.id))
  ) {
    invalidFollowTarget(res);
    return null;
  }
  return targetId;
}

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

router.get(
  '/corners/:id',
  authenticateOptional,
  async (req: AuthenticatedRequest, res) => {
    const id = req.params.id;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'community.corners.errors.not_found',
      });
    }

    try {
      const corner = await getPublicCornerDetail(id, req.user?.id);
      if (!corner) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.corners.errors.not_found',
        });
      }
      return res.json(corner);
    } catch (error) {
      console.error('Failed to load public corner detail', error);
      return res.status(500).json({
        error: 'CornerQueryFailed',
        message: 'community.corners.errors.query_failed',
      });
    }
  }
);

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
  '/corners/:id/editorial',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'community.corners.errors.editorial_admin_required',
      });
    }

    const status = req.body?.status as PublishCornerEditorialStatus;
    if (!CORNER_EDITORIAL_STATUSES.includes(status)) {
      return res.status(422).json({
        error: 'InvalidFields',
        message: 'community.corners.errors.editorial_status_invalid',
      });
    }
    const reason =
      typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    if ((status === 'needs_correction' || status === 'rejected') && !reason) {
      return res.status(422).json({
        error: 'MissingFields',
        message: 'community.corners.errors.editorial_reason_required',
      });
    }

    const updated = await updateCornerEditorialStatus(
      req.params.id,
      status,
      status === 'approved' || status === 'pending' ? null : reason
    );
    if (!updated) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'community.corners.errors.not_found',
      });
    }
    return res.json(updated);
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
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.corners.errors.not_found',
        });
      const detail = await getPublicCornerDetail(req.params.id, req.user.id);
      if (!detail)
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.corners.errors.not_found',
        });
      return res.json(detail);
    } catch (error) {
      if (error instanceof CornerValidationError)
        return res.status(422).json({ errors: error.errors });
      return res.status(500).json({
        error: 'CornerUpdateFailed',
        message: 'community.corners.errors.update_failed',
      });
    }
  }
);

router.get('/stats', async (_req, res) => {
  try {
    const stats = await getPersistedCommunityStats();
    return res.json(stats);
  } catch (error) {
    console.error('Failed to load persisted community stats', error);
    return res.status(500).json({
      error: 'CommunityStatsQueryFailed',
      message: 'community.errors.query_failed',
    });
  }
});

router.get(
  '/feed',
  authenticateOptional,
  async (req: AuthenticatedRequest, res) => {
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
    try {
      const feed = await getPersistedCommunityFeed(
        page,
        clampedSize,
        req.user?.id
      );
      return res.json(feed);
    } catch (error) {
      console.error('Failed to load persisted community feed', error);
      return res.status(500).json({
        error: 'CommunityFeedQueryFailed',
        message: 'community.errors.query_failed',
      });
    }
  }
);

router.post(
  '/posts/:postType/:id/like',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    const post = parseCommunityPostId(req.params.postType, req.params.id);
    if (!post) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'community.social.invalid_post',
      });
    }
    try {
      if (!(await isVisibleCommunityPost(post, req.user.id))) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.social.post_not_found',
        });
      }
      return res.json(await toggleCommunityPostLike(post, req.user.id));
    } catch (error) {
      console.error('Failed to toggle community like', error);
      return res.status(500).json({
        error: 'CommunityLikeFailed',
        message: 'community.social.like_failed',
      });
    }
  }
);

router.get(
  '/posts/:postType/:id/comments',
  authenticateOptional,
  async (req: AuthenticatedRequest, res) => {
    const post = parseCommunityPostId(req.params.postType, req.params.id);
    if (!post) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'community.social.invalid_post',
      });
    }
    try {
      if (!(await isVisibleCommunityPost(post, req.user?.id))) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.social.post_not_found',
        });
      }
      return res.json(await listCommunityComments(post, req.user?.id));
    } catch (error) {
      console.error('Failed to list community comments', error);
      return res.status(500).json({
        error: 'CommunityCommentsFailed',
        message: 'community.social.comments_failed',
      });
    }
  }
);

router.post(
  '/posts/:postType/:id/comments',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    const post = parseCommunityPostId(req.params.postType, req.params.id);
    if (!post) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'community.social.invalid_post',
      });
    }
    try {
      if (!(await isVisibleCommunityPost(post, req.user.id))) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'community.social.post_not_found',
        });
      }
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const comment = await createCommunityComment({
        post,
        userId: req.user.id,
        body: typeof body.body === 'string' ? body.body : '',
      });
      return res.status(201).json(comment);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'community.social.comment_failed';
      const status = message === 'community.social.comment_invalid' ? 422 : 500;
      return res.status(status).json({
        error: 'CommunityCommentError',
        message,
      });
    }
  }
);

router.post(
  '/stories',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    try {
      const story = await createCommunityStory({
        userId: req.user.id,
        body: typeof body.body === 'string' ? body.body : '',
        imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
        bookListingId:
          typeof body.bookListingId === 'string' ? body.bookListingId : null,
      });
      return res.status(201).json(story);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'community.story.create_failed';
      const status =
        message === 'community.story.body_required' ||
        message === 'community.story.book_invalid'
          ? 422
          : 500;
      return res.status(status).json({ error: 'CommunityStoryError', message });
    }
  }
);

router.get('/activity', async (_req, res) => {
  try {
    const activity = await getPersistedCommunityActivity();
    return res.json(activity);
  } catch (error) {
    console.error('Failed to load persisted community activity', error);
    return res.status(500).json({
      error: 'CommunityActivityQueryFailed',
      message: 'community.errors.query_failed',
    });
  }
});

router.get('/suggestions', async (_req, res) => {
  try {
    const suggestions = await getPersistedCommunitySuggestions();
    return res.json(suggestions);
  } catch (error) {
    console.error('Failed to load persisted community suggestions', error);
    return res.status(500).json({
      error: 'CommunitySuggestionsQueryFailed',
      message: 'community.errors.query_failed',
    });
  }
});

router.get(
  '/discovery',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    try {
      const discovery = await getCommunityDiscovery(req.user.id);
      return res.json(discovery);
    } catch (error) {
      console.error('Failed to load community discovery', error);
      return res.status(500).json({
        error: 'CommunityDiscoveryQueryFailed',
        message: 'community.errors.query_failed',
      });
    }
  }
);

router.post(
  '/follows/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    const targetId = await validateFollowTarget(req, res);
    if (!targetId) return;
    await followUser(req.user.id, targetId);
    return res.status(201).json({ following: true, userId: String(targetId) });
  }
);

router.delete(
  '/follows/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'auth.errors.unauthorized',
      });
    }
    const targetId = await validateFollowTarget(req, res);
    if (!targetId) return;
    await unfollowUser(req.user.id, targetId);
    return res.json({ following: false, userId: String(targetId) });
  }
);

export default router;
