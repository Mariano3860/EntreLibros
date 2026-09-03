import { Router } from 'express';

import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  createReport,
  type ReportTargetType,
} from '../repositories/reportRepository.js';

const router = Router();
router.use(authenticate);

const targetTypes: ReportTargetType[] = [
  'content',
  'conduct',
  'corner_missing',
];

router.post('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  }
  const body = req.body as {
    targetType?: unknown;
    targetId?: unknown;
    reason?: unknown;
  };
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (
    typeof body.targetType !== 'string' ||
    !targetTypes.includes(body.targetType as ReportTargetType) ||
    typeof body.targetId !== 'string' ||
    !body.targetId.trim() ||
    body.targetId.length > 120 ||
    reason.length < 3 ||
    reason.length > 1000
  ) {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'reports.errors.invalid',
    });
  }
  try {
    const report = await createReport({
      reporterId: req.user.id,
      targetType: body.targetType as ReportTargetType,
      targetId: body.targetId.trim(),
      reason,
    });
    return res.status(201).json({ report });
  } catch {
    return res.status(500).json({
      error: 'ReportError',
      message: 'reports.errors.failed',
    });
  }
});

export default router;
