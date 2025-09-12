import { Router } from 'express';
import { createUser, findUserByEmail } from '../repositories/userRepository.js';
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
  const user = await createUser(name, email, password);
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || ''
  );
  res.status(201).json({
    token,
    user: { id: String(user.id), email: user.email, role: user.role },
    message: 'auth.success.register',
  });
});

export default router;
