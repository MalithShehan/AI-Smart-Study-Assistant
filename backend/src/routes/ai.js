const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');
const {
  validateGenerateQuiz,
  validateSummarize,
  validateScanSummarize,
  validateAskQuestion,
  validateGenerateSpeech,
} = require('../validators/aiValidator');

// All AI endpoints require authentication and apply a per-minute rate limit
router.use(protect, aiLimiter);

// Summarize typed/pasted notes
router.post('/summarize', validateSummarize, aiController.summarizeNotes);

// Summarize OCR-extracted text from a scanned note image
router.post('/scan-summarize', validateScanSummarize, aiController.scanAndSummarize);

// Generate a multiple-choice quiz
router.post('/quiz', validateGenerateQuiz, aiController.generateQuiz);

// Answer a study question (with optional context)
router.post('/ask', validateAskQuestion, aiController.askQuestion);

// Generate speech from text (TTS)
router.post('/speak', validateGenerateSpeech, aiController.generateSpeech);

// Get personalized study recommendations
router.get('/recommendations', aiController.getRecommendations);

module.exports = router;
