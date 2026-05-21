const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

// ── Device token management ───────────────────────────────────────────────────

const registerToken = asyncHandler(async (req, res) => {
  const { token, platform, deviceName } = req.body;
  const doc = await notificationService.registerDeviceToken(req.user._id, { token, platform, deviceName });
  apiResponse.created(res, doc, 'Device token registered');
});

const unregisterToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await notificationService.unregisterDeviceToken(req.user._id, token);
  apiResponse.success(res, null, 'Device token unregistered');
});

// ── In-app notifications ──────────────────────────────────────────────────────

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const unreadOnly = req.query.unreadOnly === 'true';

  const result = await notificationService.getNotifications(req.user._id, { page, limit, unreadOnly });
  apiResponse.success(res, result, 'Notifications retrieved');
});

const markAsRead = asyncHandler(async (req, res) => {
  const notif = await notificationService.markAsRead(req.user._id, req.params.id);
  apiResponse.success(res, notif, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const count = await notificationService.markAllAsRead(req.user._id);
  apiResponse.success(res, { updated: count }, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.id);
  res.status(204).send();
});

const deleteOldNotifications = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const count = await notificationService.deleteOldNotifications(req.user._id, days);
  apiResponse.success(res, { deleted: count }, `Deleted ${count} old read notifications`);
});

// ── Test push (development helper) ───────────────────────────────────────────

const sendTestPush = asyncHandler(async (req, res) => {
  const { title = 'Test Notification', body = 'This is a test push notification.' } = req.body;
  const fcmId = await notificationService.sendPushToUser(req.user._id, {
    title,
    body,
    type: 'system',
    data: { source: 'test' },
  });
  apiResponse.success(res, { fcmMessageId: fcmId }, 'Test push sent');
});

module.exports = {
  registerToken,
  unregisterToken,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteOldNotifications,
  sendTestPush,
};
