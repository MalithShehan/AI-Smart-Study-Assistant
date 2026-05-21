const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Type
    type: {
      type: String,
      required: true,
      enum: [
        'study_session',  // manual study timer start/end
        'note_scan',      // OCR / AI scanner used
        'quiz_attempt',   // quiz generated + attempted
        'ai_summary',     // text summarised by AI
        'ai_question',    // question asked to AI
        'note_created',   // note saved to library
        'note_updated',   // note edited
        'note_deleted',   // note removed
      ],
      index: true,
    },

    // ── Context
    subject: {
      type: String,
      trim: true,
      maxlength: [80, 'Subject must be at most 80 characters'],
      default: '',
    },

    // ── Metrics
    duration: {
      type: Number, // minutes (study_session)
      min: 0,
      default: null,
    },
    score: {
      type: Number, // 0-100 percentage (quiz_attempt)
      min: 0,
      max: 100,
      default: null,
    },
    totalQuestions: {
      type: Number, // quiz total count
      min: 0,
      default: null,
    },
    correctAnswers: {
      type: Number,
      min: 0,
      default: null,
    },

    // ── Flexible extra context
    metadata: {
      noteId: { type: String, default: null },
      quizId: { type: String, default: null },
      wordsScanned: { type: Number, default: null },
      questionsGenerated: { type: Number, default: null },
      summaryLength: { type: Number, default: null },   // chars
      inputLength: { type: Number, default: null },
      tokensUsed: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
    // createdAt used as activity timestamp
  }
);

// ── Indexes for analytics queries ─────────────────────────────────────────────
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1, createdAt: -1 });
activitySchema.index({ user: 1, subject: 1 });

module.exports = mongoose.model('Activity', activitySchema);
