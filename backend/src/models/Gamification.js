const mongoose = require('mongoose');
const { Schema } = mongoose;

// ══════════════════════════════════════════════════════════════════════════════
// GAMIFICATION SYSTEM - Points, Badges, Levels, Achievements
// ══════════════════════════════════════════════════════════════════════════════

const achievementSchema = new Schema(
  {
    badgeId: {
      type: String,
      required: true,
      enum: [
        // Study Badges
        'first_note',
        'note_master_10',
        'note_master_50',
        'note_master_100',
        
        // Quiz Badges
        'quiz_beginner',
        'quiz_master_10',
        'quiz_master_50',
        'perfect_score',
        'quiz_streak_7',
        
        // AI Badges
        'ai_explorer',
        'ai_master_50',
        'ai_genius_100',
        
        // Streak Badges
        'streak_3',
        'streak_7',
        'streak_30',
        'streak_100',
        
        // Special Badges
        'early_bird',
        'night_owl',
        'weekend_warrior',
        'social_learner',
        
        // Level Badges
        'level_5',
        'level_10',
        'level_25',
        'level_50',
      ],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // emoji or icon name
    unlockedAt: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
  },
  { _id: true }
);

const gamificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    
    // Points & Level
    totalPoints: { type: Number, default: 0, index: true },
    level: { type: Number, default: 1, index: true },
    levelProgress: { type: Number, default: 0 }, // 0-100%
    pointsToNextLevel: { type: Number, default: 100 },
    
    // Achievements
    achievements: [achievementSchema],
    totalBadges: { type: Number, default: 0 },
    
    // Streak
    currentStreak: { type: Number, default: 0, index: true },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },
    streakFreezeUsed: { type: Boolean, default: false },
    
    // Stats
    stats: {
      totalStudyMinutes: { type: Number, default: 0 },
      totalQuizzes: { type: Number, default: 0 },
      totalPerfectScores: { type: Number, default: 0 },
      totalAIInteractions: { type: Number, default: 0 },
      totalNotesCreated: { type: Number, default: 0 },
      totalPapersUploaded: { type: Number, default: 0 },
    },
    
    // Leaderboard
    rank: { type: Number, default: null },
    
    // Activity History (for streak calculation)
    activityDates: [{ type: Date }], // Last 30 days
  },
  {
    timestamps: true,
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// INDEXES
// ══════════════════════════════════════════════════════════════════════════════

gamificationSchema.index({ userId: 1 });
gamificationSchema.index({ totalPoints: -1 });
gamificationSchema.index({ level: -1 });
gamificationSchema.index({ currentStreak: -1 });

// ══════════════════════════════════════════════════════════════════════════════
// METHODS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Add points and check for level up
 */
gamificationSchema.methods.addPoints = function (points, reason = 'activity') {
  this.totalPoints += points;
  
  // Calculate level (exponential growth)
  const newLevel = Math.floor(Math.sqrt(this.totalPoints / 50)) + 1;
  const leveledUp = newLevel > this.level;
  
  if (leveledUp) {
    this.level = newLevel;
  }
  
  // Calculate progress to next level
  const currentLevelPoints = Math.pow(this.level - 1, 2) * 50;
  const nextLevelPoints = Math.pow(this.level, 2) * 50;
  this.pointsToNextLevel = nextLevelPoints - this.totalPoints;
  this.levelProgress = Math.min(
    100,
    ((this.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
  );
  
  return { leveledUp, newLevel, pointsAdded: points };
};

/**
 * Unlock achievement badge
 */
gamificationSchema.methods.unlockBadge = function (badgeId, title, description, icon, points = 50) {
  // Check if already unlocked
  const exists = this.achievements.some((a) => a.badgeId === badgeId);
  if (exists) return { unlocked: false };
  
  this.achievements.push({
    badgeId,
    title,
    description,
    icon,
    points,
    unlockedAt: new Date(),
  });
  
  this.totalBadges = this.achievements.length;
  this.addPoints(points, 'badge');
  
  return { unlocked: true, badge: { badgeId, title, description, icon, points } };
};

/**
 * Update streak (call daily)
 */
gamificationSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActivityDate) {
    // First activity
    this.currentStreak = 1;
    this.lastActivityDate = today;
    this.activityDates.push(today);
    return { streakUpdated: true, currentStreak: 1, isNewStreak: true };
  }
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Already counted today
    return { streakUpdated: false, currentStreak: this.currentStreak, isNewStreak: false };
  } else if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    this.lastActivityDate = today;
    this.activityDates.push(today);
    this.streakFreezeUsed = false;
    return { streakUpdated: true, currentStreak: this.currentStreak, isNewStreak: false };
  } else if (daysDiff === 2 && this.streakFreezeUsed === false) {
    // Missed 1 day but can use freeze
    this.currentStreak += 1;
    this.lastActivityDate = today;
    this.activityDates.push(today);
    this.streakFreezeUsed = true;
    return { 
      streakUpdated: true, 
      currentStreak: this.currentStreak, 
      isNewStreak: false,
      freezeUsed: true,
    };
  } else {
    // Streak broken
    this.currentStreak = 1;
    this.lastActivityDate = today;
    this.activityDates.push(today);
    this.streakFreezeUsed = false;
    return { streakUpdated: true, currentStreak: 1, isNewStreak: true, streakBroken: true };
  }
};

/**
 * Increment activity stats
 */
gamificationSchema.methods.incrementStat = function (statName, value = 1) {
  if (this.stats[statName] !== undefined) {
    this.stats[statName] += value;
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// STATICS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get leaderboard
 */
gamificationSchema.statics.getLeaderboard = function (limit = 100) {
  return this.find()
    .sort({ totalPoints: -1, level: -1 })
    .limit(limit)
    .populate('userId', 'name profileImage')
    .select('userId totalPoints level currentStreak totalBadges');
};

/**
 * Update user rank based on points
 */
gamificationSchema.statics.updateRanks = async function () {
  const users = await this.find().sort({ totalPoints: -1, level: -1 });
  
  for (let i = 0; i < users.length; i++) {
    users[i].rank = i + 1;
    await users[i].save({ validateBeforeSave: false });
  }
  
  return { updated: users.length };
};

module.exports = mongoose.model('Gamification', gamificationSchema);
