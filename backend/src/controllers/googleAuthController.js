const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  buildTokenPayload,
} = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/v1/auth/google
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return apiResponse.error(res, 'Google ID token is required', 400);
  }

  // Verify Google token
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return apiResponse.error(res, 'Invalid Google token', 401);
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture, email_verified } = payload;

  if (!email_verified) {
    return apiResponse.error(res, 'Google email not verified', 400);
  }

  // Find or create user
  let user = await User.findOne({
    $or: [{ email }, { 'oauth.google.id': googleId }],
  }).select('+refreshTokens');

  if (user) {
    // Update Google info if not set
    if (!user.oauth?.google?.id) {
      user.oauth = user.oauth || {};
      user.oauth.google = { id: googleId, email };
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Create new user
    user = await User.create({
      name,
      email,
      isEmailVerified: true,
      profileImage: { url: picture },
      oauth: {
        google: { id: googleId, email },
      },
      // Generate random password (won't be used for OAuth login)
      password: require('crypto').randomBytes(32).toString('hex'),
    });
  }

  if (!user.isActive) {
    return apiResponse.error(res, 'Your account has been deactivated', 403);
  }

  // Generate tokens
  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  // Store refresh token
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.unshift({ token: refreshToken });
  user.refreshTokens = user.refreshTokens.slice(0, 5); // Keep last 5
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
  });
});

module.exports = { googleAuth };
