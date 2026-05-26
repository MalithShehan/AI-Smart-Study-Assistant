const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const pastPaperController = require('../controllers/pastPaperController');
const upload = require('../utils/upload');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/errorHandler');

// Validators
const validateUploadPaper = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('year').isInt({ min: 2000, max: 2050 }).withMessage('Valid year required (2000-2050)'),
  body('level')
    .isIn(['o-level', 'a-level', 'gcse', 'igcse', 'ib', 'ap', 'university', 'other'])
    .withMessage('Valid level required'),
  handleValidationErrors,
];

const validateUpdatePaper = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: 2050 })
    .withMessage('Valid year required (2000-2050)'),
  handleValidationErrors,
];

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get all papers (with filters)
router.get('/', protect, pastPaperController.getAllPapers);

// Get statistics
router.get('/stats/summary', protect, pastPaperController.getPaperStats);

// Get single paper
router.get('/:id', protect, pastPaperController.getPaper);

// Upload new paper
router.post(
  '/',
  protect,
  upload.single('file'),
  validateUploadPaper,
  pastPaperController.uploadPaper
);

// Update paper details
router.patch('/:id', protect, validateUpdatePaper, pastPaperController.updatePaper);

// Delete paper
router.delete('/:id', protect, pastPaperController.deletePaper);

// Download paper (increment count)
router.post('/:id/download', protect, pastPaperController.downloadPaper);

module.exports = router;
