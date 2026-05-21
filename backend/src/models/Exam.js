const mongoose = require('mongoose');

const examReminderSchema = new mongoose.Schema(
  {
    minutesBefore: {
      type: Number,
      required: true,
      enum: [60, 120, 360, 720, 1440, 2880, 10080], // up to 1 week
    },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
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
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [80, 'Subject must be at most 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: '',
    },

    // ── Scheduling
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    duration: {
      type: Number, // minutes
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 h)'],
      default: 120,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location must be at most 200 characters'],
      default: '',
    },

    // ── Reminders
    reminders: {
      type: [examReminderSchema],
      default: [],
    },

    // ── Outcome
    isCompleted: { type: Boolean, default: false },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be at most 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Index to efficiently find upcoming exams for reminders
examSchema.index({ user: 1, examDate: 1 });
examSchema.index({ examDate: 1, 'reminders.isSent': 1 });

module.exports = mongoose.model('Exam', examSchema);
