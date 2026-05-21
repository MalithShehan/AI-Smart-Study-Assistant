const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');
const { validateRegisterToken, validateSendTest } = require('../validators/notificationValidator');

router.use(protect);

// ── Device token registration ─────────────────────────────────────────────────
router.post('/tokens', validateRegisterToken, notificationController.registerToken);
router.delete('/tokens', notificationController.unregisterToken);

// ── In-app notification feed ──────────────────────────────────────────────────
// GET /notifications?page=1&limit=20&unreadOnly=true
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/old', notificationController.deleteOldNotifications);
router.delete('/:id', notificationController.deleteNotification);

// ── Dev/test helper ───────────────────────────────────────────────────────────
router.post('/test-push', validateSendTest, notificationController.sendTestPush);

module.exports = router;
