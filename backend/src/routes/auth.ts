import { Router } from 'express';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
} from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'MissingFields', message: 'auth.errors.missing_fields' });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return res
      .status(409)
      .json({ error: 'EmailExists', message: 'auth.errors.email_exists' });
  }
  const user = await createUser(name, email, password, 'user');
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      error: 'ServerError',
      message: 'auth.errors.jwt_not_configured',
    });
  }
  const publicUser = toPublicUser(user);
  const token = jwt.sign(
    { id: publicUser.id, email: publicUser.email, role: publicUser.role },
    jwtSecret
  );
  res.status(201).json({
    token,
    user: publicUser,
    message: 'auth.success.register',
  });
});

export default router;
