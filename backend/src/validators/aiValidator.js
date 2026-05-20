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

const validateGenerateQuiz = [
  body('topic').trim().notEmpty().withMessage('topic is required'),
  body('numQuestions')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('numQuestions must be an integer between 1 and 20'),
  handleValidationErrors,
];

const validateSummarize = [
  body('notes').trim().notEmpty().withMessage('notes are required'),
  handleValidationErrors,
];

const validateAskQuestion = [
  body('question').trim().notEmpty().withMessage('question is required'),
  body('context').optional().isString().withMessage('context must be a string'),
  handleValidationErrors,
];

module.exports = { validateGenerateQuiz, validateSummarize, validateAskQuestion };
