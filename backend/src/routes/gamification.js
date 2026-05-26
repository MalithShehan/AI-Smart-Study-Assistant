const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const gamificationController = require('../controllers/gamificationController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/errorHandler');

// ═══════════════════════════════════════════════════════════════════════════
// GAMIFICATION ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get gamification profile
router.get('/profile', protect, gamificationController.getGamificationProfile);

// Get stats
router.get('/stats', protect, gamificationController.getStats);

// Get leaderboard
router.get('/leaderboard', protect, gamificationController.getLeaderboard);

// Log activity and update streak
router.post(
  '/activity',
  protect,
  [
    body('activityType').optional().trim(),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be positive'),
    handleValidationErrors,
  ],
  gamificationController.logActivity
);

// Add points
router.post(
  '/points',
  protect,
  [
    body('points').isInt({ min: 1 }).withMessage('Points must be positive'),
    body('reason').optional().trim(),
    handleValidationErrors,
  ],
  gamificationController.addPoints
);

// Unlock badge
router.post(
  '/badge',
  protect,
  [
    body('badgeId').trim().notEmpty().withMessage('Badge ID required'),
    body('title').trim().notEmpty().withMessage('Badge title required'),
    body('description').trim().notEmpty().withMessage('Badge description required'),
    body('icon').trim().notEmpty().withMessage('Badge icon required'),
    body('points').optional().isInt({ min: 0 }),
    handleValidationErrors,
  ],
  gamificationController.unlockBadge
);

// Increment stat
router.post(
  '/increment-stat',
  protect,
  [
    body('statName').trim().notEmpty().withMessage('Stat name required'),
    body('value').optional().isInt({ min: 1 }),
    handleValidationErrors,
  ],
  gamificationController.incrementStat
);

module.exports = router;
