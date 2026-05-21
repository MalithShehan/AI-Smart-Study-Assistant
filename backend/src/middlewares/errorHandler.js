'use strict';

const config = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// ── Mongoose / JWT / known error converters ───────────────────────────────────
const _castToApiError = (err) => {
  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field '${err.path}'`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for '${field}'`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') return ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') return ApiError.unauthorized('Token has expired');

  return err; // unchanged
};

// ── 404 handler ───────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = _castToApiError(err);

  const statusCode = error.statusCode || error.status || 500;
  const isProduction = config.env === 'production';

  // Log server errors (5xx) with full stack; 4xx as warnings
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}`, {
      message: error.message,
      stack: error.stack,
      ip: req.ip,
      userId: req.user?._id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${error.message}`, {
      ip: req.ip,
      userId: req.user?._id,
    });
  }

  const body = {
    success: false,
    statusCode,
    message: isProduction && statusCode >= 500 ? 'Something went wrong' : error.message,
    ...(error.errors?.length && { errors: error.errors }),
    ...(!isProduction && { stack: error.stack }),
  };

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
