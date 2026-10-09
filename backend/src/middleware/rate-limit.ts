import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

const isTest = process.env.NODE_ENV === 'test';

export const standardRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 10000 : config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 10000 : config.AI_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request limit reached for this IP. Please wait before asking another question.',
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Upload limit exceeded. Please wait a minute before uploading additional educational resources.',
  },
});
