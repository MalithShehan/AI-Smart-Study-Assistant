'use strict';

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const adminController = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'), adminLimiter);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',                    adminController.listUsers);
router.post('/users/bulk-action',       adminController.bulkUserAction);
router.get('/users/:id',                adminController.getUser);
router.patch('/users/:id',              adminController.updateUser);
router.delete('/users/:id',             adminController.deleteUser);
router.patch('/users/:id/suspend',      adminController.suspendUser);

// ── System statistics ─────────────────────────────────────────────────────────
router.get('/stats',                    adminController.getSystemStats);
router.get('/stats/users-over-time',    adminController.getUsersOverTime);
router.get('/stats/activity-breakdown', adminController.getActivityBreakdown);

// ── Platform analytics ────────────────────────────────────────────────────────
router.get('/analytics',                adminController.getPlatformAnalytics);

// ── Content reports ───────────────────────────────────────────────────────────
router.get('/reports',                  adminController.listReports);
router.post('/reports',                 adminController.createReport);
router.patch('/reports/:id/review',     adminController.reviewReport);

module.exports = router;
