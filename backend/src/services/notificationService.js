/**
 * notificationService.js
 * Firebase Cloud Messaging (FCM) push notifications + in-app notification CRUD.
 *
 * Firebase Admin SDK is initialised lazily (only when FCM is actually used)
 * so the server starts without error even when FIREBASE_* env vars are absent
 * in development.
 */

const { Notification, DeviceToken } = require('../models/Notification');
const config = require('../config');

// ── Firebase lazy initialisation ──────────────────────────────────────────────

let firebaseApp = null;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    const serviceAccount = config.firebase.serviceAccountPath
      ? require(config.firebase.serviceAccountPath) // file path from env
      : null;

    if (!serviceAccount) {
      console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    firebaseApp = admin.apps[0];
  }

  return firebaseApp;
}

// ── Device token management ───────────────────────────────────────────────────

/**
 * Register (or refresh) an FCM device token for a user.
 */
const registerDeviceToken = async (userId, { token, platform, deviceName }) => {
  const doc = await DeviceToken.findOneAndUpdate(
    { token },
    { user: userId, token, platform: platform || 'android', deviceName: deviceName || '', isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc;
};

/**
 * Deactivate / remove an FCM token (e.g. when user logs out from a device).
 */
const unregisterDeviceToken = async (userId, token) => {
  await DeviceToken.findOneAndUpdate(
    { user: userId, token },
    { isActive: false }
  );
};

/**
 * Return all active FCM tokens for a user.
 */
const getActiveTokens = async (userId) => {
  const docs = await DeviceToken.find({ user: userId, isActive: true }).lean();
  return docs.map((d) => d.token);
};

// ── Push notification sending ─────────────────────────────────────────────────

/**
 * Send a push notification to every active device of a user.
 * Falls back silently (logs warning) when Firebase is not configured.
 *
 * @param {string} userId
 * @param {{ title: string, body: string, data?: object, type?: string }} payload
 * @returns {Promise<string|null>} FCM message id of first successful send (or null)
 */
const sendPushToUser = async (userId, { title, body, data = {}, type = 'system' }) => {
  const app = getFirebaseApp();
  const tokens = await getActiveTokens(userId);

  if (!tokens.length) return null;

  // Persist in-app notification record
  const notif = await Notification.create({
    user: userId,
    type,
    title,
    body,
    data,
  });

  if (!app) return null; // FCM not configured — record saved, push skipped

  const admin = require('firebase-admin');
  const messaging = admin.messaging(app);

  const message = {
    notification: { title, body },
    data: { ...sanitiseData(data), notificationId: notif._id.toString(), type },
    tokens,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default', badge: 1 } } },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    const firstSuccess = response.responses.find((r) => r.success);
    const fcmMessageId = firstSuccess ? firstSuccess.messageId : null;

    await Notification.findByIdAndUpdate(notif._id, {
      fcmMessageId,
      deliveredAt: new Date(),
    });

    // Deactivate tokens that FCM reports as invalid
    const invalidTokens = response.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter(Boolean);

    if (invalidTokens.length) {
      await DeviceToken.updateMany(
        { token: { $in: invalidTokens } },
        { isActive: false }
      );
    }

    return fcmMessageId;
  } catch (err) {
    console.error('[FCM] sendEachForMulticast error:', err.message);
    return null;
  }
};

/**
 * Send a push to a specific list of FCM tokens (e.g. broadcast).
 */
const sendPushToTokens = async (tokens, { title, body, data = {} }) => {
  const app = getFirebaseApp();
  if (!app || !tokens.length) return null;

  const admin = require('firebase-admin');
  const messaging = admin.messaging(app);

  const message = {
    notification: { title, body },
    data: sanitiseData(data),
    tokens,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return response;
  } catch (err) {
    console.error('[FCM] broadcast error:', err.message);
    return null;
  }
};

// ── In-app notification CRUD ──────────────────────────────────────────────────

/**
 * Paginated notification list for a user.
 */
const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount,
  };
};

/**
 * Mark one notification as read.
 */
const markAsRead = async (userId, notificationId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notif) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return notif;
};

/**
 * Mark all notifications for a user as read.
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result.modifiedCount;
};

/**
 * Delete a single notification.
 */
const deleteNotification = async (userId, notificationId) => {
  const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  if (!result) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
};

/**
 * Delete all read notifications older than `days` days.
 */
const deleteOldNotifications = async (userId, days = 30) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await Notification.deleteMany({
    user: userId,
    isRead: true,
    createdAt: { $lt: cutoff },
  });
  return result.deletedCount;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * FCM data payloads must be { [string]: string } — convert values.
 */
function sanitiseData(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
  );
}

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
  getActiveTokens,
  sendPushToUser,
  sendPushToTokens,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteOldNotifications,
};
