const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ocrController = require('../controllers/ocrController');
const { anyUpload } = require('../utils/multerMemory');
const { protect } = require('../middlewares/auth');

// ── Shared validation helpers ──────────────────────────────────────────────────
const VALID_STYLES = ['concise', 'detailed', 'bullet'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateSummarizeBody = [
  body('subject').optional().isString().withMessage('subject must be a string'),
  body('style')
    .optional()
    .isIn(VALID_STYLES)
    .withMessage(`style must be one of: ${VALID_STYLES.join(', ')}`),
  handleErrors,
];

const validateQuizBody = [
  body('topic').optional().isString().withMessage('topic must be a string'),
  body('subject').optional().isString().withMessage('subject must be a string'),
  body('numQuestions')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('numQuestions must be an integer between 1 and 20'),
  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES)
    .withMessage(`difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),
  handleErrors,
];

// All OCR endpoints require a valid JWT
router.use(protect);

/**
 * POST /api/v1/ocr/extract
 * Extract raw text from an image or text-layer PDF.
 * Multipart field: "file"
 */
router.post('/extract', anyUpload.single('file'), ocrController.extractText);

/**
 * POST /api/v1/ocr/extract-summarize
 * Extract text then AI-summarize it in one step.
 * Multipart field: "file"
 * Body (optional): subject, style
 */
router.post(
  '/extract-summarize',
  anyUpload.single('file'),
  validateSummarizeBody,
  ocrController.extractAndSummarize
);

/**
 * POST /api/v1/ocr/extract-quiz
 * Extract text then generate an MCQ quiz in one step.
 * Multipart field: "file"
 * Body (optional): topic, subject, numQuestions, difficulty
 */
router.post(
  '/extract-quiz',
  anyUpload.single('file'),
  validateQuizBody,
  ocrController.extractAndGenerateQuiz
);

module.exports = router;
