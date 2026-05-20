const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Sign a short-lived access token.
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

/**
 * Sign a long-lived refresh token.
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

/**
 * Verify an access token. Returns the decoded payload or throws.
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

/**
 * Build the public auth payload attached to responses.
 */
const buildTokenPayload = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPayload,
};
