import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { updateUserLanguage } from '../repositories/userRepository.js';

const router = Router();

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
