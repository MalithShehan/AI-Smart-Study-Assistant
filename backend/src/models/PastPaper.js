const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastPaperSchema = new Schema(
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
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2050,
      index: true,
    },
    examBoard: {
      type: String,
      enum: ['edexcel', 'cambridge', 'aqa', 'ocr', 'cie', 'ib', 'ap', 'other'],
      default: 'other',
    },
    level: {
      type: String,
      enum: ['o-level', 'a-level', 'gcse', 'igcse', 'ib', 'ap', 'university', 'other'],
      required: true,
    },
    paperType: {
      type: String,
      enum: ['theory', 'practical', 'mcq', 'essay', 'mixed'],
      default: 'theory',
    },
    file: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number, // in bytes
        required: true,
      },
      format: {
        type: String,
        default: 'pdf',
      },
    },
    tags: [{ type: String, trim: true }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
pastPaperSchema.index({ userId: 1, createdAt: -1 });
pastPaperSchema.index({ subject: 1, year: -1 });
pastPaperSchema.index({ subject: 1, examBoard: 1, year: -1 });
pastPaperSchema.index({ isPublic: 1, subject: 1 });
pastPaperSchema.index({ tags: 1 });

// Virtual for download URL
pastPaperSchema.virtual('downloadUrl').get(function () {
  return this.file.url;
});

// Method to increment download count
pastPaperSchema.methods.incrementDownloadCount = function () {
  this.downloadCount += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('PastPaper', pastPaperSchema);
