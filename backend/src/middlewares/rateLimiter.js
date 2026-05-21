'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config');

// ── Default rate limiter (all /api/v1 routes) ─────────────────────────────────
const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please slow down.' },
});

// ── Auth routes (stricter) ────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many auth attempts — try again in 15 minutes.' },
});

// ── AI / heavy endpoints ──────────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI rate limit reached — max 10 requests per minute.' },
});

// ── Admin routes ──────────────────────────────────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Admin rate limit reached.' },
});

// ── Upload endpoints ──────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload rate limit reached — max 20 uploads per minute.' },
});

// Backwards-compatible default export
module.exports = defaultLimiter;
module.exports.defaultLimiter = defaultLimiter;
module.exports.authLimiter = authLimiter;
module.exports.aiLimiter = aiLimiter;
module.exports.adminLimiter = adminLimiter;
module.exports.uploadLimiter = uploadLimiter;
