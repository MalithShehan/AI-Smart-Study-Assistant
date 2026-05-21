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

const validActivityTypes = [
  'study_session',
  'note_scan',
  'quiz_attempt',
  'ai_summary',
  'ai_question',
  'note_created',
  'note_updated',
  'note_deleted',
];

const validateLogActivity = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('type is required')
    .isIn(validActivityTypes)
    .withMessage(`type must be one of: ${validActivityTypes.join(', ')}`),
  body('subject').optional().isString().trim().isLength({ max: 80 }),
  body('duration').optional().isInt({ min: 0 }).withMessage('duration must be a non-negative integer (minutes)'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('score must be 0–100'),
  body('totalQuestions').optional().isInt({ min: 0 }),
  body('correctAnswers').optional().isInt({ min: 0 }),
  body('metadata').optional().isObject(),
  handleValidationErrors,
];

module.exports = { validateLogActivity };
