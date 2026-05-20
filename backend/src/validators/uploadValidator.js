const { param, query, validationResult } = require('express-validator');

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

const validateDeleteUpload = [
  param('publicId').notEmpty().withMessage('publicId is required'),
  query('resourceType')
    .optional()
    .isIn(['image', 'raw'])
    .withMessage('resourceType must be "image" or "raw"'),
  handleValidationErrors,
];

module.exports = { validateDeleteUpload };
