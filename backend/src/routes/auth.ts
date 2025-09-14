import { Router } from 'express';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
} from '../repositories/userRepository.js';
import { DEFAULT_USER_ROLE } from '../constants.js';
import jwt, { type Algorithm } from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
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
    { expiresIn: '24h', algorithm: jwtAlgorithm }
  );
  res
    .cookie('sessionToken', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({ user: publicUser, message: 'auth.success.register' });
});

router.post('/login', async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtAlgorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
  if (!jwtSecret) {
    return res.status(500).json({
      error: 'ServerError',
      message: 'auth.errors.jwt_not_configured',
    });
  }

  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'MissingFields', message: 'auth.errors.missing_fields' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: 'InvalidEmail',
      message: 'auth.errors.invalid_email',
    });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: 'InvalidCredentials',
      message: 'auth.errors.invalid_credentials',
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({
      error: 'InvalidCredentials',
      message: 'auth.errors.invalid_credentials',
    });
  }
  const publicUser = toPublicUser(user);
  const token = jwt.sign(
    { id: publicUser.id, email: publicUser.email, role: publicUser.role },
    jwtSecret,
    { expiresIn: '24h', algorithm: jwtAlgorithm }
  );
  res
    .cookie('sessionToken', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({ user: publicUser, message: 'auth.success.login' });
});

router.post('/logout', authenticate, (req: AuthenticatedRequest, res) => {
  res.clearCookie('sessionToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'auth.success.logout' });
});

router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  res.json(req.user);
});

export default router;
