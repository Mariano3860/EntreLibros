import { Router } from 'express';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
  DEFAULT_USER_ROLE,
} from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const router = Router();

router.post('/register', async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      error: 'ServerError',
      message: 'auth.errors.jwt_not_configured',
    });
  }

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
  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ error: 'InvalidEmail', message: 'auth.errors.invalid_email' });
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ error: 'WeakPassword', message: 'auth.errors.weak_password' });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return res
      .status(409)
      .json({ error: 'EmailExists', message: 'auth.errors.email_exists' });
  }
  const user = await createUser(name, email, password, DEFAULT_USER_ROLE);
  const publicUser = toPublicUser(user);
  const token = jwt.sign(
    { id: publicUser.id, email: publicUser.email, role: publicUser.role },
    jwtSecret,
    { expiresIn: '24h' }
  );
  res.status(201).json({
    token,
    user: publicUser,
    message: 'auth.success.register',
  });
});

export default router;
