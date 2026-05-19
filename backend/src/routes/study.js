const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

// GET all study sessions
router.get('/sessions', studyController.getSessions);

// POST create a new study session
router.post('/sessions', studyController.createSession);

// GET a single study session by ID
router.get('/sessions/:id', studyController.getSessionById);

// DELETE a study session
router.delete('/sessions/:id', studyController.deleteSession);

module.exports = router;
