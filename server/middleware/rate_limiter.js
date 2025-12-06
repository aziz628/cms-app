import rateLimit from 'express-rate-limit';
import  AppError  from '../errors/AppError.js';

// Global request counter across all IPs
let globalRequestCount = 0;
let globalWindowStart = Date.now();
const GLOBAL_LIMIT = 50000;  // Total requests per minute globally
const GLOBAL_WINDOW = 60 * 1000;

// Global middleware - tracks TOTAL requests across all IPs
export function globalLimiter(req, res, next) {
  const now = Date.now();
  
  // Reset counter if window expired
  if (now - globalWindowStart > GLOBAL_WINDOW) {
    globalRequestCount = 0;
    globalWindowStart = now;
  }
  
  globalRequestCount++;
  
  // If exceeded global limit, reject
  if (globalRequestCount > GLOBAL_LIMIT && process.env.NODE_ENV !== 'test') {
    return next(new AppError(
      'Service temporarily unavailable due to high traffic.',
      503,
      'RATE_LIMITED_GLOBAL'
    ));
  }
  
  next();
}



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

// Admin limiter for admin routes
export const adminLimiter = createLimiter(
  60 * 1000,      // 1 minute
  3000,           // 3000 requests
  'RATE_LIMITED_ADMIN',
  'Too many admin requests , please try again later.'
);

// Public limiter for public API/resources
export const publicLimiter = createLimiter(
  60 * 1000,      // 1 minute
  2000,           // 2000 requests
  'RATE_LIMITED_PUBLIC',
  'Too many requests'
);

