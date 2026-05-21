const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

// ── Activity logging (called internally by other controllers too) ─────────────

const logActivity = asyncHandler(async (req, res) => {
  const activity = await analyticsService.logActivity(req.user._id, req.body);
  apiResponse.created(res, activity, 'Activity logged');
});

// ── Activity feed ─────────────────────────────────────────────────────────────

const getActivities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const { type, subject, startDate, endDate } = req.query;

  const result = await analyticsService.getActivities(req.user._id, {
    page,
    limit,
    type,
    subject,
    startDate,
    endDate,
  });
  apiResponse.success(res, result, 'Activities retrieved');
});

// ── Analytics endpoints ────────────────────────────────────────────────────────

const getOverviewStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getOverviewStats(req.user._id);
  apiResponse.success(res, stats, 'Overview stats retrieved');
});

const getStudyTimeByDay = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
  const data = await analyticsService.getStudyTimeByDay(req.user._id, days);
  apiResponse.success(res, data, 'Study time by day retrieved');
});

const getActivityBySubject = asyncHandler(async (req, res) => {
  const data = await analyticsService.getActivityBySubject(req.user._id);
  apiResponse.success(res, data, 'Activity by subject retrieved');
});

const getQuizPerformanceHistory = asyncHandler(async (req, res) => {
  const data = await analyticsService.getQuizPerformanceHistory(req.user._id);
  apiResponse.success(res, data, 'Quiz performance history retrieved');
});

const getAiUsageStats = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAiUsageStats(req.user._id);
  apiResponse.success(res, data, 'AI usage stats retrieved');
});

const getLearningAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getLearningAnalytics(req.user._id);
  apiResponse.success(res, data, 'Learning analytics retrieved');
});

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
