const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const studyStatsSchema = new mongoose.Schema(
  {
    totalStudyMinutes: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    totalNotesCreated: { type: Number, default: 0 },
    totalQuizzesCompleted: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0, min: 0, max: 100 },
    streakDays: { type: Number, default: 0 },
    longestStreakDays: { type: Number, default: 0 },
    lastStudiedAt: { type: Date, default: null },
  },
  { _id: false }
);

const savedNoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    subject: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    isFavourite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main User schema ─────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── Identity
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },

    // ── Profile
    profileImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // for cloud storage (e.g. Cloudinary)
    },
    bio: { type: String, maxlength: 300, default: '' },
    institution: { type: String, trim: true, default: '' },
    subjects: [{ type: String, trim: true }],

    // ── Role & access
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    isActive: { type: Boolean, default: true },

    // ── Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // ── Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Refresh tokens (supports multiple devices)
    refreshTokens: {
      type: [{ token: String, createdAt: { type: Date, default: Date.now } }],
      select: false,
    },

    // ── FCM tokens for push notifications (supports multiple devices)
    fcmTokens: {
      type: [String],
      default: [],
      select: false,
    },

    // ── OAuth providers
    oauth: {
      google: {
        id: { type: String, default: null },
        email: { type: String, default: null },
      },
      apple: {
        id: { type: String, default: null },
        email: { type: String, default: null },
      },
    },

    // ── Study data
    studyStats: { type: studyStatsSchema, default: () => ({}) },
    savedNotes: { type: [savedNoteSchema], default: [] },

    // ── Timestamps
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, config.bcrypt.saltRounds);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// ── Instance methods ─────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 h
  return rawToken;
};

userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return rawToken;
};

/** Returns true if the JWT was issued before a password change. */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIssuedAt;
  }
  return false;
};

// ── Virtual: full profile image URL ─────────────────────────────────────────
userSchema.virtual('profileImageUrl').get(function () {
  return this.profileImage?.url || null;
});

// ── Statics ──────────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

module.exports = mongoose.model('User', userSchema);
