import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  findPublicProfileById,
  updateUserLanguage,
  updateUserProfile,
  type UserProfileUpdate,
} from '../repositories/userRepository.js';

const router = Router();

const PROFILE_VISIBILITIES = ['public', 'private'] as const;
const LOCATION_VISIBILITIES = ['private', 'city', 'neighborhood'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

router.get('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'user.errors.unauthenticated',
    });
  }
  return res.json(req.user);
});

router.get('/profile/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'user.errors.profile_not_found',
    });
  }
  const profile = await findPublicProfileById(id);
  if (!profile) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'user.errors.profile_not_found',
    });
  }
  return res.json(profile);
});

router.patch(
  '/profile',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }
    if (!isRecord(req.body)) {
      return res.status(400).json({
        error: 'InvalidFields',
        message: 'user.errors.invalid_profile',
      });
    }
    const updates: UserProfileUpdate = {};
    if (req.body.alias !== undefined) {
      const alias = optionalText(req.body.alias, 80);
      if (!alias) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.alias = alias;
    }
    if (req.body.description !== undefined) {
      const description = optionalText(req.body.description, 500);
      if (req.body.description !== null && description === null) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.profileDescription = description;
    }
    if (req.body.profileVisibility !== undefined) {
      if (!PROFILE_VISIBILITIES.includes(req.body.profileVisibility as never)) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.profileVisibility = req.body
        .profileVisibility as UserProfileUpdate['profileVisibility'];
    }
    if (req.body.locationVisibility !== undefined) {
      if (
        !LOCATION_VISIBILITIES.includes(req.body.locationVisibility as never)
      ) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.locationVisibility = req.body
        .locationVisibility as UserProfileUpdate['locationVisibility'];
    }
    if (req.body.language !== undefined) {
      const language = optionalText(req.body.language, 10);
      if (!language) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.language = language;
    }
    const profile = await updateUserProfile(req.user.id, updates);
    return profile
      ? res.json(profile)
      : res.status(404).json({
          error: 'NotFound',
          message: 'user.errors.profile_not_found',
        });
  }
);

router.post(
  '/language',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    const { language } = req.body as { language?: string };
    if (!language) {
      return res.status(400).json({
        error: 'MissingFields',
        message: 'user.errors.missing_language',
      });
    }
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }
    await updateUserLanguage(req.user.id, language);
    res.json({ language });
  }
);

export default router;
