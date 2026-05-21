/**
 * analyticsService.js
 * Track user activities + aggregate learning analytics.
 */

const Activity = require('../models/Activity');

// ── Activity logging ──────────────────────────────────────────────────────────

/**
 * Record a single user activity event.
 */
const logActivity = async (userId, { type, subject, duration, score, totalQuestions, correctAnswers, metadata } = {}) => {
  return Activity.create({
    user: userId,
    type,
    subject: subject || '',
    duration: duration ?? null,
    score: score ?? null,
    totalQuestions: totalQuestions ?? null,
    correctAnswers: correctAnswers ?? null,
    metadata: metadata || {},
  });
};

/**
 * Paginated activity feed for a user.
 */
const getActivities = async (userId, { page = 1, limit = 20, type, subject, startDate, endDate } = {}) => {
  const filter = { user: userId };
  if (type) filter.type = type;
  if (subject) filter.subject = new RegExp(subject, 'i');
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// ── Aggregated statistics ─────────────────────────────────────────────────────

/**
 * High-level overview stats for a user's dashboard.
 */
const getOverviewStats = async (userId) => {
  const [totals, quizStats, aiStats, streakInfo] = await Promise.all([
    _getTotals(userId),
    _getQuizStats(userId),
    _getAiStats(userId),
    _getStreakInfo(userId),
  ]);

  return { totals, quizStats, aiStats, streakInfo };
};

/**
 * Study time broken down by day for the past N days.
 * Returns [{ date: 'YYYY-MM-DD', minutes: number }]
 */
const getStudyTimeByDay = async (userId, days = 30) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const result = await Activity.aggregate([
    {
      $match: {
        user: _toObjectId(userId),
        type: 'study_session',
        createdAt: { $gte: since },
        duration: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        minutes: { $sum: '$duration' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', minutes: 1 } },
  ]);

  return result;
};

/**
 * Activity count broken down by subject.
 */
const getActivityBySubject = async (userId) => {
  const result = await Activity.aggregate([
    { $match: { user: _toObjectId(userId), subject: { $nin: ['', null] } } },
    {
      $group: {
        _id: '$subject',
        totalActivities: { $sum: 1 },
        totalMinutes: { $sum: { $ifNull: ['$duration', 0] } },
      },
    },
    { $sort: { totalActivities: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, subject: '$_id', totalActivities: 1, totalMinutes: 1 } },
  ]);
  return result;
};

/**
 * Quiz performance over time.
 * Returns last 20 quiz attempts with date and score.
 */
const getQuizPerformanceHistory = async (userId) => {
  const result = await Activity.find(
    { user: userId, type: 'quiz_attempt', score: { $ne: null } },
    { createdAt: 1, subject: 1, score: 1, totalQuestions: 1, correctAnswers: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return result.map((a) => ({
    date: a.createdAt,
    subject: a.subject,
    score: a.score,
    totalQuestions: a.totalQuestions,
    correctAnswers: a.correctAnswers,
  }));
};

/**
 * AI usage stats (summaries, questions, scans).
 */
const getAiUsageStats = async (userId) => {
  const result = await Activity.aggregate([
    {
      $match: {
        user: _toObjectId(userId),
        type: { $in: ['ai_summary', 'ai_question', 'note_scan'] },
      },
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalTokens: { $sum: { $ifNull: ['$metadata.tokensUsed', 0] } },
      },
    },
    { $project: { _id: 0, type: '$_id', count: 1, totalTokens: 1 } },
  ]);
  return result;
};

/**
 * Full learning analytics report.
 */
const getLearningAnalytics = async (userId) => {
  const [overview, studyByDay, bySubject, quizHistory, aiUsage] = await Promise.all([
    getOverviewStats(userId),
    getStudyTimeByDay(userId, 30),
    getActivityBySubject(userId),
    getQuizPerformanceHistory(userId),
    getAiUsageStats(userId),
  ]);

  return { overview, studyByDay, bySubject, quizHistory, aiUsage };
};

// ── Private helpers ───────────────────────────────────────────────────────────

async function _getTotals(userId) {
  const result = await Activity.aggregate([
    { $match: { user: _toObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalStudyMinutes: { $sum: { $cond: [{ $eq: ['$type', 'study_session'] }, { $ifNull: ['$duration', 0] }, 0] } },
        totalSessions: { $sum: { $cond: [{ $eq: ['$type', 'study_session'] }, 1, 0] } },
        totalScans: { $sum: { $cond: [{ $eq: ['$type', 'note_scan'] }, 1, 0] } },
        totalQuizzes: { $sum: { $cond: [{ $eq: ['$type', 'quiz_attempt'] }, 1, 0] } },
        totalAiSummaries: { $sum: { $cond: [{ $eq: ['$type', 'ai_summary'] }, 1, 0] } },
        totalAiQuestions: { $sum: { $cond: [{ $eq: ['$type', 'ai_question'] }, 1, 0] } },
        totalNotesCreated: { $sum: { $cond: [{ $eq: ['$type', 'note_created'] }, 1, 0] } },
      },
    },
  ]);

  return result[0]
    ? { ...result[0], _id: undefined }
    : {
        totalStudyMinutes: 0,
        totalSessions: 0,
        totalScans: 0,
        totalQuizzes: 0,
        totalAiSummaries: 0,
        totalAiQuestions: 0,
        totalNotesCreated: 0,
      };
}

async function _getQuizStats(userId) {
  const result = await Activity.aggregate([
    { $match: { user: _toObjectId(userId), type: 'quiz_attempt', score: { $ne: null } } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalQuestions: { $sum: { $ifNull: ['$totalQuestions', 0] } },
        totalCorrect: { $sum: { $ifNull: ['$correctAnswers', 0] } },
      },
    },
  ]);

  if (!result[0]) return { totalAttempts: 0, averageScore: 0, bestScore: 0 };
  const r = result[0];
  return {
    totalAttempts: r.totalAttempts,
    averageScore: Math.round(r.averageScore * 10) / 10,
    bestScore: r.bestScore,
    totalQuestions: r.totalQuestions,
    totalCorrect: r.totalCorrect,
  };
}

async function _getAiStats(userId) {
  const result = await Activity.aggregate([
    {
      $match: {
        user: _toObjectId(userId),
        type: { $in: ['ai_summary', 'ai_question', 'note_scan'] },
      },
    },
    {
      $group: {
        _id: null,
        totalAiUsage: { $sum: 1 },
        totalTokensUsed: { $sum: { $ifNull: ['$metadata.tokensUsed', 0] } },
        totalWordsScanned: { $sum: { $ifNull: ['$metadata.wordsScanned', 0] } },
      },
    },
  ]);

  return result[0]
    ? { totalAiUsage: result[0].totalAiUsage, totalTokensUsed: result[0].totalTokensUsed, totalWordsScanned: result[0].totalWordsScanned }
    : { totalAiUsage: 0, totalTokensUsed: 0, totalWordsScanned: 0 };
}

async function _getStreakInfo(userId) {
  // Get distinct study dates in descending order
  const dates = await Activity.aggregate([
    { $match: { user: _toObjectId(userId), type: 'study_session' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  if (!dates.length) return { currentStreak: 0, longestStreak: 0, lastStudiedAt: null };

  const dateStrings = dates.map((d) => d._id);
  const today = new Date().toISOString().slice(0, 10);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;
  for (const ds of dateStrings) {
    if (ds === checkDate) {
      currentStreak++;
      // Decrement date
      const prev = new Date(checkDate);
      prev.setUTCDate(prev.getUTCDate() - 1);
      checkDate = prev.toISOString().slice(0, 10);
    } else {
      break;
    }
  }

  // Calculate longest streak (sorted ascending for easier traversal)
  const ascending = [...dateStrings].reverse();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < ascending.length; i++) {
    const prev = new Date(ascending[i - 1]);
    prev.setUTCDate(prev.getUTCDate() + 1);
    if (prev.toISOString().slice(0, 10) === ascending[i]) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: longest,
    lastStudiedAt: dates[0]?._id || null,
  };
}

const mongoose = require('mongoose');
function _toObjectId(id) {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
}

module.exports = {
  logActivity,
  getActivities,
  getOverviewStats,
  getStudyTimeByDay,
  getActivityBySubject,
  getQuizPerformanceHistory,
  getAiUsageStats,
  getLearningAnalytics,
};
