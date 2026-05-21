const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');
const { validateLogActivity } = require('../validators/analyticsValidator');

router.use(protect);

// ── Activity feed ─────────────────────────────────────────────────────────────
// GET  /analytics/activities?page=1&limit=20&type=quiz_attempt&subject=Math
router.get('/activities', analyticsController.getActivities);
router.post('/activities', validateLogActivity, analyticsController.logActivity);

// ── Analytics reports ─────────────────────────────────────────────────────────
// Full learning analytics (all-in-one for dashboard)
router.get('/learning', analyticsController.getLearningAnalytics);

// Individual breakdowns
router.get('/overview', analyticsController.getOverviewStats);
router.get('/study-time', analyticsController.getStudyTimeByDay);         // ?days=30
router.get('/by-subject', analyticsController.getActivityBySubject);
router.get('/quiz-history', analyticsController.getQuizPerformanceHistory);
router.get('/ai-usage', analyticsController.getAiUsageStats);

module.exports = router;
