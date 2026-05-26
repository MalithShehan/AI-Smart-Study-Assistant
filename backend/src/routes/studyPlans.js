const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const studyPlanController = require('../controllers/studyPlanController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/errorHandler');

// ═══════════════════════════════════════════════════════════════════════════
// STUDY PLAN ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get stats
router.get('/stats/overview', protect, studyPlanController.getStats);

// Get today's plan
router.get('/today', protect, studyPlanController.getTodaysPlan);

// Get all plans (with filters)
router.get('/', protect, studyPlanController.getStudyPlans);

// Generate AI study plan
router.post(
  '/generate',
  protect,
  [
    body('date').optional().isISO8601().withMessage('Valid date required'),
    body('subjects').optional().isArray().withMessage('Subjects must be an array'),
    body('studyHours').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Study hours must be between 0.5 and 12'),
    body('focusAreas').optional().isArray(),
    body('preferredTime').optional().isIn(['morning', 'afternoon', 'evening']),
    handleValidationErrors,
  ],
  studyPlanController.generateStudyPlan
);

// Get single plan
router.get('/:id', protect, studyPlanController.getStudyPlan);

// Update plan
router.patch(
  '/:id',
  protect,
  [
    body('title').optional().trim(),
    body('summary').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'skipped']),
    handleValidationErrors,
  ],
  studyPlanController.updateStudyPlan
);

// Delete plan
router.delete('/:id', protect, studyPlanController.deleteStudyPlan);

// Complete task
router.patch('/:id/task/:taskId/complete', protect, studyPlanController.completeTask);

// Add task
router.post(
  '/:id/task',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Task title required'),
    body('subject').trim().notEmpty().withMessage('Subject required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be positive'),
    body('type').isIn(['revision', 'practice', 'quiz', 'reading', 'video', 'break']),
    body('priority').optional().isIn(['high', 'medium', 'low']),
    handleValidationErrors,
  ],
  studyPlanController.addTask
);

// Remove task
router.delete('/:id/task/:taskId', protect, studyPlanController.removeTask);

module.exports = router;
