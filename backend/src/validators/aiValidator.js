const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
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

const VALID_STYLES = ['concise', 'detailed', 'bullet'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

const validateGenerateQuiz = [
  body('topic').trim().notEmpty().withMessage('topic is required'),
  body('notes').optional().isString().withMessage('notes must be a string'),
  body('numQuestions')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('numQuestions must be an integer between 1 and 20'),
  body('difficulty')
    .optional()
    .isIn(VALID_DIFFICULTIES)
    .withMessage(`difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`),
  handleValidationErrors,
];

const validateSummarize = [
  body('notes').trim().notEmpty().withMessage('notes are required'),
  body('subject').optional().isString().withMessage('subject must be a string'),
  body('style')
    .optional()
    .isIn(VALID_STYLES)
    .withMessage(`style must be one of: ${VALID_STYLES.join(', ')}`),
  handleValidationErrors,
];

const validateScanSummarize = [
  body('extractedText')
    .trim()
    .notEmpty()
    .withMessage('extractedText is required')
    .isLength({ max: 50000 })
    .withMessage('extractedText must not exceed 50 000 characters'),
  body('subject').optional().isString().withMessage('subject must be a string'),
  body('style')
    .optional()
    .isIn(VALID_STYLES)
    .withMessage(`style must be one of: ${VALID_STYLES.join(', ')}`),
  handleValidationErrors,
];

const validateAskQuestion = [
  body('question').trim().notEmpty().withMessage('question is required'),
  body('context')
    .optional()
    .isString()
    .isLength({ max: 30000 })
    .withMessage('context must be a string and not exceed 30 000 characters'),
  handleValidationErrors,
];

module.exports = {
  validateGenerateQuiz,
  validateSummarize,
  validateScanSummarize,
  validateAskQuestion,
};
