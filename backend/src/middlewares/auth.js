const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

/**
 * protect — verifies Bearer access token, attaches req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiResponse.error(res, 'Unauthorized: no token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
    return apiResponse.error(res, message, 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) return apiResponse.error(res, 'User no longer exists', 401);
  if (!user.isActive) return apiResponse.error(res, 'Account has been deactivated', 403);
  if (user.changedPasswordAfter(decoded.iat))
    return apiResponse.error(res, 'Password changed recently — please log in again', 401);

  req.user = user;
  next();
});

/**
 * requireEmailVerified — use after protect.
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified)
    return apiResponse.error(res, 'Please verify your email to access this resource', 403);
  next();
};

/**
 * authorize(...roles) — restrict to specific roles, use after protect.
 * Example: router.delete('/:id', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return apiResponse.error(res, `Role '${req.user.role}' is not permitted`, 403);
  next();
};

module.exports = { protect, requireEmailVerified, authorize };
