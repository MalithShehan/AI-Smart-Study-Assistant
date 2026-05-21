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

const validateRegisterToken = [
  body('token').trim().notEmpty().withMessage('FCM token is required'),
  body('platform').optional().isIn(['ios', 'android', 'web']).withMessage('platform must be ios, android or web'),
  body('deviceName').optional().isString().trim().isLength({ max: 100 }),
  handleValidationErrors,
];

const validateSendTest = [
  body('title').optional().isString().trim().isLength({ max: 120 }),
  body('body').optional().isString().trim().isLength({ max: 500 }),
  handleValidationErrors,
];

module.exports = { validateRegisterToken, validateSendTest };
