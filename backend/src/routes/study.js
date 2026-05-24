const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { protect } = require('../middlewares/auth');
const { validateCreateSession } = require('../validators/studyValidator');

// All study routes require authentication
router.use(protect);

router.get('/sessions', studyController.getSessions);
router.post('/sessions', validateCreateSession, studyController.createSession);
router.get('/sessions/:id', studyController.getSessionById);
router.delete('/sessions/:id', studyController.deleteSession);

module.exports = router;
