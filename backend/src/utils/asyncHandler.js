/**
 * Wraps async route handlers so that any thrown error is forwarded
 * to Express's next(err) error-handling middleware automatically.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
