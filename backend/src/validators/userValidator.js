const { body } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
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

const validateUpdateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio must be at most 300 characters'),
  body('institution').optional().trim().isString(),
  body('subjects').optional().isArray().withMessage('subjects must be an array'),
  handleValidationErrors,
];

const validateAddNote = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('content').trim().notEmpty().withMessage('content is required'),
  body('subject').optional().trim().isString(),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  handleValidationErrors,
];

module.exports = { validateUpdateProfile, validateAddNote };
