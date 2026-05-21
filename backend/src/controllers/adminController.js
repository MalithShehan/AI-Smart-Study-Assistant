'use strict';

const User = require('../models/User');
const Activity = require('../models/Activity');
const Report = require('../models/Report');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ── Helper ─────────────────────────────────────────────────────────────────────
const _startOfDay = (d = new Date()) => {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
};

// ──────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users with pagination and search
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -passwordResetToken -emailVerificationToken -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return apiResponse.success(res, 'Users retrieved', {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a single user's full profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User detail
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
const getUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid user ID');

  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken -emailVerificationToken -refreshTokens')
    .lean();
  if (!user) throw ApiError.notFound('User not found');

  // Fetch recent activities for this user
  const recentActivity = await Activity.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return apiResponse.success(res, 'User retrieved', { user, recentActivity });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a user's role or active status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
const updateUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid user ID');

  // Admins cannot demote themselves
  if (req.params.id === req.user._id.toString() && req.body.role === 'student') {
    throw ApiError.forbidden('You cannot remove your own admin role');
  }

  const allowed = ['role', 'isActive', 'isEmailVerified'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
    .select('-password -passwordResetToken -emailVerificationToken -refreshTokens');
  if (!user) throw ApiError.notFound('User not found');

  logger.info(`Admin ${req.user._id} updated user ${user._id}`, updates);
  return apiResponse.success(res, 'User updated', { user });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Permanently delete a user and all their data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid user ID');
  if (req.params.id === req.user._id.toString()) throw ApiError.forbidden('Cannot delete yourself');

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  // Cascade delete user data
  await Promise.allSettled([
    Activity.deleteMany({ user: user._id }),
    Timetable.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
    Report.deleteMany({ reportedBy: user._id }),
  ]);

  logger.warn(`Admin ${req.user._id} deleted user ${user._id} (${user.email})`);
  return apiResponse.success(res, 'User and all associated data deleted');
});

/**
 * @swagger
 * /admin/users/{id}/suspend:
 *   patch:
 *     tags: [Admin]
 *     summary: Suspend (deactivate) a user account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User suspended
 */
const suspendUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid user ID');
  if (req.params.id === req.user._id.toString()) throw ApiError.forbidden('Cannot suspend yourself');

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, refreshTokens: [] },
    { new: true }
  ).select('name email isActive');
  if (!user) throw ApiError.notFound('User not found');

  logger.warn(`Admin ${req.user._id} suspended user ${user._id}`);
  return apiResponse.success(res, 'User account suspended', { user });
});

// ──────────────────────────────────────────────────────────────────────────────
// SYSTEM STATISTICS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get overall system statistics
 *     responses:
 *       200:
 *         description: System stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemStats'
 */
const getSystemStats = asyncHandler(async (_req, res) => {
  const today = _startOfDay();

  const [
    totalUsers, activeUsers, newUsersToday,
    totalActivities, activitiesToday,
    pendingReports, totalReports,
    aiActivities, aiActivitiesToday,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: today } }),
    Activity.countDocuments(),
    Activity.countDocuments({ createdAt: { $gte: today } }),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments(),
    Activity.countDocuments({ type: { $in: ['ai_summary', 'ai_question'] } }),
    Activity.countDocuments({
      type: { $in: ['ai_summary', 'ai_question'] },
      createdAt: { $gte: today },
    }),
  ]);

  return apiResponse.success(res, 'System stats retrieved', {
    users: { total: totalUsers, active: activeUsers, newToday: newUsersToday },
    activities: { total: totalActivities, today: activitiesToday },
    reports: { total: totalReports, pending: pendingReports },
    ai: { totalRequests: aiActivities, requestsToday: aiActivitiesToday },
  });
});

/**
 * @swagger
 * /admin/stats/users-over-time:
 *   get:
 *     tags: [Admin]
 *     summary: Get user registrations over the last 30 days
 *     responses:
 *       200:
 *         description: Daily registration counts
 */
const getUsersOverTime = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  return apiResponse.success(res, 'User registrations over time', { data });
});

/**
 * @swagger
 * /admin/stats/activity-breakdown:
 *   get:
 *     tags: [Admin]
 *     summary: Get activity breakdown by type for the last 7 days
 *     responses:
 *       200:
 *         description: Activity breakdown
 */
const getActivityBreakdown = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const data = await Activity.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { type: '$_id', count: 1, _id: 0 } },
  ]);

  return apiResponse.success(res, 'Activity breakdown', { data });
});

// ──────────────────────────────────────────────────────────────────────────────
// REPORT / CONTENT MODERATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: List all content reports
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved, dismissed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reports list
 */
const listReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.targetType) filter.targetType = req.query.targetType;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);

  return apiResponse.success(res, 'Reports retrieved', {
    reports,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @swagger
 * /admin/reports/{id}/review:
 *   patch:
 *     tags: [Admin]
 *     summary: Review and resolve a content report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reviewed, resolved, dismissed]
 *               reviewNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 */
const reviewReport = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid report ID');

  const { status, reviewNote } = req.body;
  const validStatuses = ['reviewed', 'resolved', 'dismissed'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  ).populate('reportedBy', 'name email');
  if (!report) throw ApiError.notFound('Report not found');

  logger.info(`Admin ${req.user._id} reviewed report ${report._id} → ${status}`);
  return apiResponse.success(res, 'Report updated', { report });
});

/**
 * @swagger
 * /admin/reports:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new content report (used by users; available to admin too)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetType, targetId, reason]
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [note, quiz, user, comment]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [spam, inappropriate, plagiarism, misinformation, other]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 */
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;

  if (!mongoose.isValidObjectId(targetId)) throw ApiError.badRequest('Invalid targetId');

  const report = await Report.create({
    reportedBy: req.user._id,
    targetType,
    targetId,
    reason,
    description,
  });

  return apiResponse.created(res, 'Report submitted', { report });
});

// ──────────────────────────────────────────────────────────────────────────────
// ANALYTICS (ADMIN VIEW)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform-wide analytics for the last N days
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Platform analytics
 */
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [
    dailyActiveUsers,
    topSubjects,
    quizStats,
    aiUsage,
  ] = await Promise.all([
    // DAU per day
    Activity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          uniqueUsers: { $addToSet: '$user' },
        },
      },
      { $project: { date: '$_id.date', dau: { $size: '$uniqueUsers' }, _id: 0 } },
      { $sort: { date: 1 } },
    ]),

    // Top subjects
    Activity.aggregate([
      { $match: { createdAt: { $gte: since }, subject: { $ne: null, $exists: true } } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { subject: '$_id', count: 1, _id: 0 } },
    ]),

    // Quiz averages
    Activity.aggregate([
      { $match: { type: 'quiz_attempt', score: { $exists: true }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          avgQuestions: { $avg: '$totalQuestions' },
        },
      },
    ]),

    // AI usage per day
    Activity.aggregate([
      {
        $match: {
          type: { $in: ['ai_summary', 'ai_question'] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]),
  ]);

  return apiResponse.success(res, 'Platform analytics', {
    period: { days, since },
    dailyActiveUsers,
    topSubjects,
    quizStats: quizStats[0] || { avgScore: 0, totalAttempts: 0, avgQuestions: 0 },
    aiUsage,
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// CONTENT MODERATION — bulk actions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/users/bulk-action:
 *   post:
 *     tags: [Admin]
 *     summary: Apply a bulk action to multiple users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds, action]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, setStudent, setAdmin]
 *     responses:
 *       200:
 *         description: Bulk action applied
 */
const bulkUserAction = asyncHandler(async (req, res) => {
  const { userIds, action } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw ApiError.badRequest('userIds must be a non-empty array');
  }
  // Filter out the requesting admin's own ID for safety
  const safeIds = userIds.filter((id) => id !== req.user._id.toString());

  let update;
  switch (action) {
    case 'activate':   update = { isActive: true };  break;
    case 'deactivate': update = { isActive: false, refreshTokens: [] }; break;
    case 'setStudent': update = { role: 'student' }; break;
    case 'setAdmin':   update = { role: 'admin' };   break;
    default: throw ApiError.badRequest(`Unknown action: ${action}`);
  }

  const result = await User.updateMany(
    { _id: { $in: safeIds } },
    update
  );

  logger.info(`Admin ${req.user._id} bulk-action '${action}' on ${result.modifiedCount} users`);
  return apiResponse.success(res, `Bulk action '${action}' applied`, {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });
});

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  getSystemStats,
  getUsersOverTime,
  getActivityBreakdown,
  listReports,
  reviewReport,
  createReport,
  getPlatformAnalytics,
  bulkUserAction,
};
