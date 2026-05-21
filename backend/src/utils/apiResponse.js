/**
 * Standardised API response helpers.
 * All responses follow the shape: { success, message, data }.
 */

const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Created') =>
  success(res, data, message, 201);

const error = (res, message = 'Error', statusCode = 400, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });

module.exports = { success, created, error };
