const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST generate a quiz from topic
router.post('/quiz', aiController.generateQuiz);

// POST summarize study notes
router.post('/summarize', aiController.summarizeNotes);

// POST ask a study question
router.post('/ask', aiController.askQuestion);

module.exports = router;
