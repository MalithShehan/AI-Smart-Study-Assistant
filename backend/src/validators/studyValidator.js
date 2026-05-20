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

const validateCreateSession = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('subject').trim().notEmpty().withMessage('subject is required'),
  body('notes').optional().isString().withMessage('notes must be a string'),
  handleValidationErrors,
];

module.exports = { validateCreateSession };
