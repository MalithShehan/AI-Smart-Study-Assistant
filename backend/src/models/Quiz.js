const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        explanation: { type: String },
        points: { type: Number, default: 10 },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    timeLimit: {
      type: Number, // in seconds
      default: null, // null means no time limit
    },
    tags: [{ type: String, trim: true }],
    source: {
      type: String,
      enum: ['ai_generated', 'manual', 'imported'],
      default: 'ai_generated',
    },
    aiPrompt: {
      type: String, // Store the original AI prompt for regeneration
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ subject: 1, difficulty: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for completion rate
quizSchema.virtual('completionRate').get(function () {
  if (this.attemptCount === 0) return 0;
  return Math.round(this.averageScore);
});

// Pre-save hook to calculate total points
quizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    this.totalQuestions = this.questions.length;
  }
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
