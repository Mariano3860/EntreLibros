import { Router } from 'express';
import {
  ContactValidationError,
  submitContactMessage,
} from '../services/contact.js';

const router = Router();

router.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};
    const payload = {
      name: typeof name === 'string' ? name : '',
      email: typeof email === 'string' ? email : '',
      message: typeof message === 'string' ? message : '',
    };

    const saved = await submitContactMessage(payload);

    return res.status(201).json(saved);
  } catch (error) {
    if (error instanceof ContactValidationError) {
      return res.status(400).json({ errors: error.errors });
    }

    console.error('contact.submit.failed', error);
    return res.status(500).json({
      error: 'ContactSubmitFailed',
      message: 'contact.errors.submit_failed',
    });
  }
});

export default router;
