const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const apiResponse = require('../utils/apiResponse');
const Gamification = require('../models/Gamification');
const User = require('../models/User');

// ══════════════════════════════════════════════════════════════════════════════
// GAMIFICATION CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/gamification/profile
 * @desc    Get user's gamification profile
 * @access  Private
 */
const getGamificationProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  let gamification = await Gamification.findOne({ userId }).populate(
    'userId',
    'name profileImage'
  );
  
  // Create if doesn't exist
  if (!gamification) {
    gamification = await Gamification.create({ userId });
    await gamification.populate('userId', 'name profileImage');
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, gamification, 'Gamification profile retrieved successfully'));
});

/**
 * @route   POST /api/v1/gamification/points
 * @desc    Add points to user
 * @access  Private
 */
const addPoints = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { points, reason } = req.body;
  
  if (!points || points <= 0) {
    throw new ApiError(400, 'Valid points value required');
  }
  
  let gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    gamification = await Gamification.create({ userId });
  }
  
  const result = gamification.addPoints(points, reason);
  await gamification.save();
  
  return res
    .status(200)
    .json(
      new apiResponse(200, { ...result, gamification }, 'Points added successfully')
    );
});

/**
 * @route   POST /api/v1/gamification/activity
 * @desc    Log activity and update streak
 * @access  Private
 */
const logActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { activityType, points = 10 } = req.body;
  
  let gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    gamification = await Gamification.create({ userId });
  }
  
  // Update streak
  const streakResult = gamification.updateStreak();
  
  // Add points for activity
  const pointsResult = gamification.addPoints(points, activityType);
  
  // Check for streak badges
  let badgeUnlocked = null;
  if (gamification.currentStreak === 3) {
    badgeUnlocked = gamification.unlockBadge(
      'streak_3',
      '3-Day Streak 🔥',
      'Studied for 3 consecutive days!',
      '🔥',
      50
    );
  } else if (gamification.currentStreak === 7) {
    badgeUnlocked = gamification.unlockBadge(
      'streak_7',
      'Week Warrior 🏅',
      'Studied for 7 consecutive days!',
      '🏅',
      100
    );
  } else if (gamification.currentStreak === 30) {
    badgeUnlocked = gamification.unlockBadge(
      'streak_30',
      'Monthly Master 🌟',
      'Studied for 30 consecutive days!',
      '🌟',
      300
    );
  } else if (gamification.currentStreak === 100) {
    badgeUnlocked = gamification.unlockBadge(
      'streak_100',
      'Century Champion 👑',
      'Studied for 100 consecutive days!',
      '👑',
      1000
    );
  }
  
  await gamification.save();
  
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          streak: streakResult,
          points: pointsResult,
          badge: badgeUnlocked?.unlocked ? badgeUnlocked.badge : null,
          gamification,
        },
        'Activity logged successfully'
      )
    );
});

/**
 * @route   POST /api/v1/gamification/badge
 * @desc    Unlock achievement badge
 * @access  Private
 */
const unlockBadge = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { badgeId, title, description, icon, points = 50 } = req.body;
  
  if (!badgeId || !title || !description || !icon) {
    throw new ApiError(400, 'Badge details required');
  }
  
  let gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    gamification = await Gamification.create({ userId });
  }
  
  const result = gamification.unlockBadge(badgeId, title, description, icon, points);
  await gamification.save();
  
  if (!result.unlocked) {
    return res
      .status(200)
      .json(new apiResponse(200, { alreadyUnlocked: true }, 'Badge already unlocked'));
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, result, 'Badge unlocked successfully'));
});

/**
 * @route   GET /api/v1/gamification/leaderboard
 * @desc    Get leaderboard
 * @access  Private
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  const userId = req.user._id;
  
  const leaderboard = await Gamification.getLeaderboard(parseInt(limit));
  
  // Find user's rank
  const userGamification = await Gamification.findOne({ userId });
  const userRank = userGamification?.rank || null;
  
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          leaderboard,
          userRank,
          userPoints: userGamification?.totalPoints || 0,
        },
        'Leaderboard retrieved successfully'
      )
    );
});

/**
 * @route   GET /api/v1/gamification/stats
 * @desc    Get user's gamification stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    throw new ApiError(404, 'Gamification profile not found');
  }
  
  const stats = {
    level: gamification.level,
    totalPoints: gamification.totalPoints,
    pointsToNextLevel: gamification.pointsToNextLevel,
    levelProgress: gamification.levelProgress,
    currentStreak: gamification.currentStreak,
    longestStreak: gamification.longestStreak,
    totalBadges: gamification.totalBadges,
    rank: gamification.rank,
    stats: gamification.stats,
  };
  
  return res
    .status(200)
    .json(new apiResponse(200, stats, 'Stats retrieved successfully'));
});

/**
 * @route   POST /api/v1/gamification/increment-stat
 * @desc    Increment specific stat
 * @access  Private
 */
const incrementStat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { statName, value = 1 } = req.body;
  
  if (!statName) {
    throw new ApiError(400, 'Stat name required');
  }
  
  let gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    gamification = await Gamification.create({ userId });
  }
  
  gamification.incrementStat(statName, value);
  
  // Check for stat-based badges
  let badgeUnlocked = null;
  
  if (statName === 'totalNotesCreated') {
    if (gamification.stats.totalNotesCreated === 1) {
      badgeUnlocked = gamification.unlockBadge(
        'first_note',
        'First Note 📝',
        'Created your first note!',
        '📝',
        25
      );
    } else if (gamification.stats.totalNotesCreated === 10) {
      badgeUnlocked = gamification.unlockBadge(
        'note_master_10',
        'Note Taker 📚',
        'Created 10 notes!',
        '📚',
        50
      );
    } else if (gamification.stats.totalNotesCreated === 50) {
      badgeUnlocked = gamification.unlockBadge(
        'note_master_50',
        'Note Master 🎓',
        'Created 50 notes!',
        '🎓',
        150
      );
    }
  }
  
  if (statName === 'totalQuizzes') {
    if (gamification.stats.totalQuizzes === 1) {
      badgeUnlocked = gamification.unlockBadge(
        'quiz_beginner',
        'Quiz Beginner 🎯',
        'Completed your first quiz!',
        '🎯',
        25
      );
    } else if (gamification.stats.totalQuizzes === 10) {
      badgeUnlocked = gamification.unlockBadge(
        'quiz_master_10',
        'Quiz Master 🏆',
        'Completed 10 quizzes!',
        '🏆',
        100
      );
    }
  }
  
  await gamification.save();
  
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          [statName]: gamification.stats[statName],
          badge: badgeUnlocked?.unlocked ? badgeUnlocked.badge : null,
        },
        'Stat updated successfully'
      )
    );
});

module.exports = {
  getGamificationProfile,
  addPoints,
  logActivity,
  unlockBadge,
  getLeaderboard,
  getStats,
  incrementStat,
};
