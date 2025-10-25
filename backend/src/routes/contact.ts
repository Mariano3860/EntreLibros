import { Router } from 'express';
import {
  ContactValidationError,
  submitContactMessage,
} from '../services/contact.js';

const router = Router();

router.post('/submit', async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'message'];
    const body = req.body ?? {};
    const unexpectedFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        error: 'contact.errors.unexpected_fields',
        fields: unexpectedFields,
      });
    }

    const { name, email, message } = body;
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
