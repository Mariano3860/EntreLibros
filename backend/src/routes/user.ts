import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { listUserActivity } from '../repositories/activityRepository.js';
import {
  createUserBlock,
  deleteUserBlock,
  findPublicProfileById,
  findUserById,
  hasUserBlock,
  updateUserLanguage,
  updateUserProfile,
  type UserProfileUpdate,
} from '../repositories/userRepository.js';
import {
  isProfileCountry,
  isProfileCity,
  isProfileInterest,
  isProfileNeighborhood,
  type ProfileCity,
} from '../constants/profileCatalog.js';

const router = Router();

router.get(
  '/activity',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }

    try {
      const activity = await listUserActivity(req.user.id);
      return res.json(activity);
    } catch (error) {
      console.error('Failed to list user activity', error);
      return res.status(500).json({
        error: 'ActivityQueryFailed',
        message: 'user.errors.activity_query_failed',
      });
    }
  }
);

const PROFILE_VISIBILITIES = ['public', 'private'] as const;
const LOCATION_VISIBILITIES = [
  'none',
  'country',
  'city',
  'neighborhood',
] as const;
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

function isValidProfilePhoto(value: string): boolean {
  if (/^https:\/\/[^\s]+$/i.test(value)) return true;
  const match = value.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i
  );
  if (!match) return false;
  return Math.floor((match[2].length * 3) / 4) <= MAX_PROFILE_PHOTO_BYTES;
}

function blockTargetId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function invalidBlockTarget(res: Response) {
  return res.status(404).json({
    error: 'NotFound',
    message: 'user.errors.block_target_not_found',
  });
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

router.put(
  '/blocks/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }
    const blockedId = blockTargetId(req.params.id);
    if (!blockedId || blockedId === req.user.id) {
      return invalidBlockTarget(res);
    }
    const target = await findUserById(blockedId);
    if (!target || target.role === 'bot') {
      return invalidBlockTarget(res);
    }
    await createUserBlock(req.user.id, blockedId);
    return res.status(204).send();
  }
);

router.delete(
  '/blocks/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }
    const blockedId = blockTargetId(req.params.id);
    if (!blockedId || blockedId === req.user.id) {
      return invalidBlockTarget(res);
    }
    await deleteUserBlock(req.user.id, blockedId);
    return res.status(204).send();
  }
);

router.get(
  '/blocks/:id',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'user.errors.unauthenticated',
      });
    }
    const blockedId = blockTargetId(req.params.id);
    if (!blockedId || blockedId === req.user.id) {
      return invalidBlockTarget(res);
    }
    const target = await findUserById(blockedId);
    if (!target || target.role === 'bot') {
      return invalidBlockTarget(res);
    }
    return res.json({ blocked: await hasUserBlock(req.user.id, blockedId) });
  }
);

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
    if (req.body.profilePhoto !== undefined) {
      if (
        req.body.profilePhoto !== null &&
        (typeof req.body.profilePhoto !== 'string' ||
          !isValidProfilePhoto(req.body.profilePhoto.trim()))
      ) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.profilePhoto =
        typeof req.body.profilePhoto === 'string'
          ? req.body.profilePhoto.trim()
          : null;
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
    if (req.body.interests !== undefined) {
      const interests = req.body.interests;
      if (
        !Array.isArray(interests) ||
        interests.length > 8 ||
        new Set(interests).size !== interests.length ||
        !interests.every(isProfileInterest)
      ) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.interests = interests;
    }
    if (req.body.country !== undefined) {
      if (!isProfileCountry(req.body.country)) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.country = req.body.country;
    }
    if (req.body.city !== undefined) {
      if (req.body.city !== null && !isProfileCity(req.body.city)) {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
      updates.city = req.body.city as ProfileCity | null;
      if (req.body.neighborhood === undefined) {
        updates.neighborhood = null;
      }
    }
    if (req.body.neighborhood !== undefined) {
      if (req.body.neighborhood === null) {
        updates.neighborhood = null;
      } else {
        const city = (
          updates.city !== undefined ? updates.city : req.user.city
        ) as ProfileCity | null;
        if (
          !city ||
          !isProfileCity(city) ||
          !isProfileNeighborhood(city, req.body.neighborhood)
        ) {
          return res.status(400).json({
            error: 'InvalidFields',
            message: 'user.errors.invalid_profile',
          });
        }
        updates.neighborhood = req.body.neighborhood;
      }
    }
    if (req.body.street !== undefined) {
      if (req.body.street === null) {
        updates.street = null;
      } else if (typeof req.body.street === 'string') {
        const street = req.body.street.trim();
        if (street.length > 160) {
          return res.status(400).json({
            error: 'InvalidFields',
            message: 'user.errors.invalid_profile',
          });
        }
        updates.street = street || null;
      } else {
        return res.status(400).json({
          error: 'InvalidFields',
          message: 'user.errors.invalid_profile',
        });
      }
    }
    try {
      const profile = await updateUserProfile(req.user.id, updates);
      return profile
        ? res.json(profile)
        : res.status(404).json({
            error: 'NotFound',
            message: 'user.errors.profile_not_found',
          });
    } catch (error) {
      console.error('Failed to update user profile', error);
      return res.status(500).json({
        error: 'ProfileUpdateFailed',
        message: 'user.errors.profile_update_failed',
      });
    }
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
