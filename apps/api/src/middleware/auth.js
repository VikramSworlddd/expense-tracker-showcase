import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const COOKIE_NAME = 'expensetracker_token';

export function authMiddleware(req, res, next) {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

