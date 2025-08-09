import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import db from '../db/index.js';
import { loginSchema } from '../validation/schemas.js';
import { generateToken, setAuthCookie, clearAuthCookie, authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Rate limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: { message: 'Too many login attempts, try again later', code: 'RATE_LIMITED' } }
});

// POST /api/auth/login
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);

  if (!validPassword) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.json({
    user: {
      id: user.id,
      email: user.email
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  res.json({ user });
});

export default router;

