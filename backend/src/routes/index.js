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
const adminRoutes = require('./admin');
const resultsRoutes = require('./results');
const papersRoutes = require('./papers');
const gamificationRoutes = require('./gamification');
const studyPlansRoutes = require('./studyPlans');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ocr', ocrRoutes);
router.use('/timetable', timetableRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/results', resultsRoutes);
router.use('/papers', papersRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/study-plans', studyPlansRoutes);

module.exports = router;
