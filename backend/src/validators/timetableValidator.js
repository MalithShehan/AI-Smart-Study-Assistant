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

// ── Shared ────────────────────────────────────────────────────────────────────

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
const validReminderMinutes = [5, 10, 15, 30, 60, 120, 1440];
const validExamReminderMinutes = [60, 120, 360, 720, 1440, 2880, 10080];

// ── Timetable entry validators ────────────────────────────────────────────────

const validateCreateEntry = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 120 }).withMessage('title max 120 chars'),
  body('subject').optional().isString().trim().isLength({ max: 80 }),
  body('type').optional().isIn(['study', 'revision', 'lecture', 'break', 'other']).withMessage('Invalid type'),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('color').optional().matches(hexColorRegex).withMessage('color must be a hex color e.g. #FF7A00'),
  body('startTime').trim().notEmpty().withMessage('startTime is required').matches(timeRegex).withMessage('startTime must be HH:mm'),
  body('endTime').trim().notEmpty().withMessage('endTime is required').matches(timeRegex).withMessage('endTime must be HH:mm'),
  body('isRecurring').optional().isBoolean(),
  body('date').optional().isISO8601().withMessage('date must be a valid ISO 8601 date'),
  body('recurrence').optional().isObject(),
  body('recurrence.frequency').optional().isIn(['daily', 'weekly']),
  body('recurrence.daysOfWeek').optional().isArray(),
  body('recurrence.daysOfWeek.*').optional().isInt({ min: 0, max: 6 }),
  body('recurrence.startDate').optional().isISO8601(),
  body('recurrence.endDate').optional().isISO8601(),
  body('reminders').optional().isArray(),
  body('reminders.*.minutesBefore')
    .optional()
    .isInt()
    .custom((v) => validReminderMinutes.includes(Number(v)))
    .withMessage(`minutesBefore must be one of ${validReminderMinutes.join(', ')}`),
  handleValidationErrors,
];

const validateUpdateEntry = [
  body('title').optional().trim().notEmpty().isLength({ max: 120 }),
  body('subject').optional().isString().trim().isLength({ max: 80 }),
  body('type').optional().isIn(['study', 'revision', 'lecture', 'break', 'other']),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('color').optional().matches(hexColorRegex),
  body('startTime').optional().matches(timeRegex).withMessage('startTime must be HH:mm'),
  body('endTime').optional().matches(timeRegex).withMessage('endTime must be HH:mm'),
  body('isRecurring').optional().isBoolean(),
  body('date').optional().isISO8601(),
  body('reminders').optional().isArray(),
  body('reminders.*.minutesBefore')
    .optional()
    .isInt()
    .custom((v) => validReminderMinutes.includes(Number(v))),
  handleValidationErrors,
];

// ── Exam validators ───────────────────────────────────────────────────────────

const validateCreateExam = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 150 }),
  body('subject').trim().notEmpty().withMessage('subject is required').isLength({ max: 80 }),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('examDate').notEmpty().withMessage('examDate is required').isISO8601().withMessage('examDate must be a valid ISO 8601 date/time'),
  body('duration').optional().isInt({ min: 1, max: 1440 }).withMessage('duration must be 1–1440 minutes'),
  body('location').optional().isString().trim().isLength({ max: 200 }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
  body('reminders').optional().isArray(),
  body('reminders.*.minutesBefore')
    .optional()
    .isInt()
    .custom((v) => validExamReminderMinutes.includes(Number(v)))
    .withMessage(`minutesBefore must be one of ${validExamReminderMinutes.join(', ')}`),
  handleValidationErrors,
];

const validateUpdateExam = [
  body('title').optional().trim().notEmpty().isLength({ max: 150 }),
  body('subject').optional().trim().notEmpty().isLength({ max: 80 }),
  body('examDate').optional().isISO8601(),
  body('duration').optional().isInt({ min: 1, max: 1440 }),
  body('location').optional().isString().trim().isLength({ max: 200 }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('score must be 0–100'),
  body('isCompleted').optional().isBoolean(),
  body('reminders').optional().isArray(),
  body('reminders.*.minutesBefore')
    .optional()
    .isInt()
    .custom((v) => validExamReminderMinutes.includes(Number(v))),
  handleValidationErrors,
];

module.exports = { validateCreateEntry, validateUpdateEntry, validateCreateExam, validateUpdateExam };
