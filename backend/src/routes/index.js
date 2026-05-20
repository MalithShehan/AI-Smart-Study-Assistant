const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const aiRoutes = require('./ai');
const studyRoutes = require('./study');
const uploadRoutes = require('./uploads');
const ocrRoutes = require('./ocr');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ocr', ocrRoutes);

module.exports = router;
