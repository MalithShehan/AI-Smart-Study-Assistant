const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
} = require('../validators/authValidator');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.patch('/reset-password/:token', validateResetPassword, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// ── Protected ─────────────────────────────────────────────────────────────────
router.use(protect);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/change-password', validateChangePassword, authController.changePassword);
router.post('/resend-verification', authController.resendVerificationEmail);

module.exports = router;
