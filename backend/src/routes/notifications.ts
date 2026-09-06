import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  getNotificationPreference,
  listNotifications,
  markNotificationRead,
  setNotificationPreference,
} from '../repositories/notificationRepository.js';
import { createAgreementReminderNotifications } from '../services/notifications.js';
import {
  asyncHandler,
  logPublicError,
  publicErrorResponse,
} from '../utils/publicErrors.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    try {
      await createAgreementReminderNotifications().catch(() => undefined);
      return res.json({ notifications: await listNotifications(req.user.id) });
    } catch (error) {
      logPublicError('Failed to load notifications', error, {
        userId: req.user.id,
      });
      const response = publicErrorResponse(error, {
        status: 500,
        code: 'NotificationError',
        key: 'notifications.errors.failed',
      });
      return res.status(response.status).json(response.body);
    }
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1)
      return res.status(422).json({
        error: 'ValidationError',
        message: 'notifications.errors.id_required',
      });
    try {
      const updated = await markNotificationRead(id, req.user.id);
      if (!updated)
        return res.status(404).json({
          error: 'NotFound',
          message: 'notifications.errors.not_found',
        });
      return res.status(204).send();
    } catch (error) {
      logPublicError('Failed to mark notification as read', error, {
        userId: req.user.id,
        notificationId: id,
      });
      const response = publicErrorResponse(error, {
        status: 500,
        code: 'NotificationError',
        key: 'notifications.errors.failed',
      });
      return res.status(response.status).json(response.body);
    }
  })
);

router.get(
  '/preferences',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    try {
      return res.json({
        inAppEnabled: await getNotificationPreference(req.user.id),
      });
    } catch (error) {
      logPublicError('Failed to load notification preferences', error, {
        userId: req.user.id,
      });
      const response = publicErrorResponse(error, {
        status: 500,
        code: 'NotificationError',
        key: 'notifications.errors.failed',
      });
      return res.status(response.status).json(response.body);
    }
  })
);

router.patch(
  '/preferences',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user || typeof req.body?.inAppEnabled !== 'boolean')
      return res.status(422).json({
        error: 'ValidationError',
        message: 'notifications.errors.preference_invalid',
      });
    try {
      await setNotificationPreference(req.user.id, req.body.inAppEnabled);
      return res.json({ inAppEnabled: req.body.inAppEnabled });
    } catch (error) {
      logPublicError('Failed to update notification preferences', error, {
        userId: req.user.id,
      });
      const response = publicErrorResponse(error, {
        status: 500,
        code: 'NotificationError',
        key: 'notifications.errors.failed',
      });
      return res.status(response.status).json(response.body);
    }
  })
);

export default router;
