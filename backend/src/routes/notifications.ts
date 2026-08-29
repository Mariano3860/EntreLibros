import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  getNotificationPreference,
  listNotifications,
  markNotificationRead,
  setNotificationPreference,
} from '../repositories/notificationRepository.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  return res.json({ notifications: await listNotifications(req.user.id) });
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(422).json({ error: 'ValidationError', message: 'notifications.errors.id_required' });
  const updated = await markNotificationRead(id, req.user.id);
  if (!updated) return res.status(404).json({ error: 'NotFound', message: 'notifications.errors.not_found' });
  return res.status(204).send();
});

router.get('/preferences', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  return res.json({ inAppEnabled: await getNotificationPreference(req.user.id) });
});

router.patch('/preferences', async (req: AuthenticatedRequest, res) => {
  if (!req.user || typeof req.body?.inAppEnabled !== 'boolean') return res.status(422).json({ error: 'ValidationError', message: 'notifications.errors.preference_invalid' });
  await setNotificationPreference(req.user.id, req.body.inAppEnabled);
  return res.json({ inAppEnabled: req.body.inAppEnabled });
});

export default router;
