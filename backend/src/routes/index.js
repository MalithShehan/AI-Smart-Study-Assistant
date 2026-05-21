const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const aiRoutes = require('./ai');
const studyRoutes = require('./study');
const uploadRoutes = require('./uploads');
const ocrRoutes = require('./ocr');
const timetableRoutes = require('./timetable');
const notificationRoutes = require('./notifications');
const analyticsRoutes = require('./analytics');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ocr', ocrRoutes);
router.use('/timetable', timetableRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
