const mongoose = require('mongoose');

// ── FCM device token ──────────────────────────────────────────────────────────

const deviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      default: 'android',
    },
    deviceName: {
      type: String,
      trim: true,
      maxlength: [100, 'Device name too long'],
      default: '',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deviceTokenSchema.index({ user: 1, isActive: 1 });

// ── In-app notification record ────────────────────────────────────────────────

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'study_reminder',
        'exam_reminder',
        'ai_update',
        'achievement',
        'quiz_result',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Title too long'],
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Body too long'],
    },
    // Optional deep-link / action data forwarded to the app
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Read state
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    // FCM delivery tracking
    fcmMessageId: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { DeviceToken, Notification };
