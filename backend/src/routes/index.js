const express = require('express');
const router = express.Router();

const aiRoutes = require('./ai');
const studyRoutes = require('./study');

router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);

module.exports = router;
