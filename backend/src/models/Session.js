const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [80, 'Subject must be at most 80 characters'],
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

sessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
