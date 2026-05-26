const mongoose = require('mongoose');
const { Schema } = mongoose;

const resultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
      description: 'Time taken in seconds',
    },
    questions: [
      {
        id: String,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        options: [String],
        isCorrect: Boolean,
        explanation: {
          type: String,
          default: null,
        },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
resultSchema.index({ userId: 1, completedAt: -1 });
resultSchema.index({ quizId: 1, completedAt: -1 });
resultSchema.index({ userId: 1, percentage: -1 });

module.exports = mongoose.model('Result', resultSchema);
