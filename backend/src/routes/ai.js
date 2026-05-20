const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { validateGenerateQuiz, validateSummarize, validateAskQuestion } = require('../validators/aiValidator');

router.post('/quiz', validateGenerateQuiz, aiController.generateQuiz);
router.post('/summarize', validateSummarize, aiController.summarizeNotes);
router.post('/ask', validateAskQuestion, aiController.askQuestion);

module.exports = router;
