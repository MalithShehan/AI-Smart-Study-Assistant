'use strict';

/**
 * ApiError — structured error with HTTP status code and optional validation details.
 * All thrown ApiError instances are handled by the global errorHandler middleware.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode  HTTP status code (4xx / 5xx)
   * @param {string} message     Human-readable error message
   * @param {Array}  [errors]    Optional array of validation / field errors
   * @param {boolean} [isOperational=true]  Operational errors are expected; programming errors are not.
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;         // field-level validation details
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers ─────────────────────────────────────────────────────────
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, [], false);
  }
}

module.exports = ApiError;
