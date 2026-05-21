'use strict';

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');

// ── MongoDB Injection Sanitization ────────────────────────────────────────────
// Strips keys containing '$' and '.' from req.body, req.query, req.params
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    // Only log in development; avoid leaking info in production
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[MongoSanitize] Sanitized key '${key}' in ${req.method} ${req.originalUrl}`);
    }
  },
});

// ── XSS Sanitization ──────────────────────────────────────────────────────────
// Recursively sanitizes all string values in an object
const _sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {},      // no HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }
  if (Array.isArray(value)) return value.map(_sanitizeValue);
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = _sanitizeValue(v);
    }
    return result;
  }
  return value;
};

const xssSanitize = (req, _res, next) => {
  if (req.body) req.body = _sanitizeValue(req.body);
  if (req.query) req.query = _sanitizeValue(req.query);
  if (req.params) req.params = _sanitizeValue(req.params);
  next();
};

// ── HTTP Parameter Pollution Prevention ──────────────────────────────────────
// Allows whitelist of params that may appear multiple times (e.g. tags[])
const hppMiddleware = hpp({
  whitelist: ['tags', 'subjects', 'types', 'roles'],
});

module.exports = { mongoSanitizeMiddleware, xssSanitize, hppMiddleware };
