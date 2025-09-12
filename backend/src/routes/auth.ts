import { Router } from 'express';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
  DEFAULT_USER_ROLE,
} from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Bad Request - One of the following errors occurred
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: MissingFields
 *                     message:
 *                       type: string
 *                       example: auth.errors.missing_fields
 *                   description: Required fields are missing from the request body.
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: InvalidEmail
 *                     message:
 *                       type: string
 *                       example: auth.errors.invalid_email
 *                   description: The email provided is not valid.
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: WeakPassword
 *                     message:
 *                       type: string
 *                       example: auth.errors.weak_password
 *                   description: The password does not meet complexity requirements.
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: EmailExists
 *                 message:
 *                   type: string
 *                   example: auth.errors.email_exists
 */
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

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
*         description: Successful login. Returns a JWT token in the response body and sets it as an `httpOnly` `sessionToken` cookie used for authentication. Clients should rely on the cookie for subsequent requests; the token field is provided for reference.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - token
 *                 - user
 *                 - message
*               properties:
*                 token:
*                   type: string
*                 user:
*                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
*                 message:
*                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: sessionToken cookie containing the JWT
*       400:
 *         description: The request is invalid due to missing required fields or invalid email format.
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: MissingFields
 *                   message: auth.errors.missing_fields
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   error: InvalidEmail
 *                   message: auth.errors.invalid_email
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET;
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
    { expiresIn: '24h' }
  );
  res
    .cookie('sessionToken', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({ token, user: publicUser, message: 'auth.success.login' });
});

export default router;
