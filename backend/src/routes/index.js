const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const aiRoutes = require('./ai');
const studyRoutes = require('./study');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);

module.exports = router;
