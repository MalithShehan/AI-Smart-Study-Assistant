const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  buildTokenPayload,
} = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// ── Helpers ──────────────────────────────────────────────────────────────────

const sendTokens = (res, user, statusCode = 200, message = 'Success') => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return res.status(statusCode).json({
    success: true,
    message,
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
};

// ── Register ─────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findByEmail(email);
  if (existing) {
    return apiResponse.error(res, 'Email already in use', 409);
  }

  const user = await User.create({ name, email, password });

  // Send verification email
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch {
    // Don't fail registration if email delivery fails
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }

  return sendTokens(res, user, 201, 'Registration successful. Please verify your email.');
});

// ── Login ─────────────────────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    return apiResponse.error(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return apiResponse.error(res, 'Your account has been deactivated', 403);
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token (keep last 5 devices)
  user.refreshTokens = [
    { token: refreshToken },
    ...user.refreshTokens.slice(0, 4),
  ];
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
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

// ── Refresh Token ─────────────────────────────────────────────────────────────

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return apiResponse.error(res, 'Refresh token is required', 400);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return apiResponse.error(res, 'Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) return apiResponse.error(res, 'User not found', 401);

  const stored = user.refreshTokens.find((rt) => rt.token === token);
  if (!stored) return apiResponse.error(res, 'Refresh token has been revoked', 401);

  // Rotate: remove old, issue new
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  const payload = buildTokenPayload(user);
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  user.refreshTokens.unshift({ token: newRefreshToken });
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: 'Token refreshed',
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    const user = await User.findById(req.user.id).select('+refreshTokens');
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
      await user.save({ validateBeforeSave: false });
    }
  }
  return apiResponse.success(res, null, 'Logged out successfully');
});

// ── Verify Email ──────────────────────────────────────────────────────────────

const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) return apiResponse.error(res, 'Token is invalid or has expired', 400);

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return apiResponse.success(res, null, 'Email verified successfully');
});

// ── Resend Verification Email ─────────────────────────────────────────────────

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    '+emailVerificationToken +emailVerificationExpires'
  );

  if (user.isEmailVerified) {
    return apiResponse.error(res, 'Email is already verified', 400);
  }

  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, token);

  return apiResponse.success(res, null, 'Verification email sent');
});

// ── Forgot Password ───────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findByEmail(req.body.email).select(
    '+passwordResetToken +passwordResetExpires'
  );

  // Always return 200 to prevent email enumeration
  if (!user) {
    return apiResponse.success(
      res,
      null,
      'If that email exists, a reset link has been sent.'
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return apiResponse.error(res, 'Error sending reset email. Try again later.', 500);
  }

  return apiResponse.success(res, null, 'If that email exists, a reset link has been sent.');
});

// ── Reset Password ────────────────────────────────────────────────────────────

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

  if (!user) return apiResponse.error(res, 'Token is invalid or has expired', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Invalidate all refresh tokens on password reset
  user.refreshTokens = [];
  await user.save();

  return sendTokens(res, user, 200, 'Password reset successful. Please log in again.');
});

// ── Get Current User ──────────────────────────────────────────────────────────

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return apiResponse.error(res, 'User not found', 404);
  return apiResponse.success(res, { user }, 'Profile retrieved');
});

// ── Change Password ───────────────────────────────────────────────────────────

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password +refreshTokens');
  if (!(await user.comparePassword(currentPassword))) {
    return apiResponse.error(res, 'Current password is incorrect', 401);
  }

  user.password = newPassword;
  user.refreshTokens = []; // invalidate other sessions
  await user.save();

  return sendTokens(res, user, 200, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};
