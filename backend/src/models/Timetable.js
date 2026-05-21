const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const reminderSchema = new mongoose.Schema(
  {
    minutesBefore: {
      type: Number,
      required: true,
      enum: [5, 10, 15, 30, 60, 120, 1440], // 1440 = 24 h
    },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  },
  { _id: false }
);

const recurrenceSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
    },
    // 0 = Sunday … 6 = Saturday (only used when frequency = 'weekly')
    daysOfWeek: {
      type: [{ type: Number, min: 0, max: 6 }],
      default: [],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const timetableSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Content
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [80, 'Subject must be at most 80 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: ['study', 'revision', 'lecture', 'break', 'other'],
      default: 'study',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: '',
    },
    color: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'],
      default: '#FF7A00',
    },

    // ── Timing (HH:mm 24-hour strings)
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be HH:mm'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'endTime must be HH:mm'],
    },

    // ── One-time vs recurring
    isRecurring: { type: Boolean, default: false },
    // Used when isRecurring = false
    date: {
      type: Date,
      default: null,
    },
    // Used when isRecurring = true
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },

    // ── Reminders
    reminders: {
      type: [reminderSchema],
      default: [],
    },

    // ── Completion
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
timetableSchema.index({ user: 1, date: 1 });
timetableSchema.index({ user: 1, 'recurrence.startDate': 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
