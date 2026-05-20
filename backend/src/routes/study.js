const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { validateCreateSession } = require('../validators/studyValidator');

router.get('/sessions', studyController.getSessions);
router.post('/sessions', validateCreateSession, studyController.createSession);
router.get('/sessions/:id', studyController.getSessionById);
router.delete('/sessions/:id', studyController.deleteSession);

module.exports = router;
