import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * Global rate limiter
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // relaxed in dev
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' }
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth endpoint rate limiter (strict)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5, // relaxed in dev
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts, please try again later.' }
    });
  },
  skip: (req) => req.method === 'GET'
});

/**
 * API endpoint rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 1000 : 30, // relaxed in dev
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' }
    });
  }
});
