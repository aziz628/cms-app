import rateLimit from 'express-rate-limit';
import  AppError  from '../errors/AppError.js';

// Create limiter factory with consistent error handling
function createLimiter(windowMs, max, errorCode, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new AppError(message || 'Too many requests', 429, errorCode));
    }
  });
}

// Predefined limiters
export const authLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes
  5,               // 5 attempts
  'RATE_LIMITED_AUTH',
  'Too many authentication attempts , please try again later.'
);

export const adminLimiter = createLimiter(
  60 * 1000,      // 1 minute
  30,             // 30 requests
  'RATE_LIMITED_ADMIN',
  'Too many admin requests , please try again later.'
);

export const publicLimiter = createLimiter(
  60 * 1000,      // 1 minute
  1000,            // 1000 requests
  'RATE_LIMITED_PUBLIC',
  'Too many requests'
);

// Global limiter
export const globalLimiter = createLimiter(
  5 * 60 * 1000,  // 5 minutes
  5000,            // 5000 requests
  'RATE_LIMITED',
  'Too many requests'
);

