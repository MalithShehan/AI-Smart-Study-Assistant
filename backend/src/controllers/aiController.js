const aiService = require('../services/aiService');
const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, notes, numQuestions = 5, difficulty = 'medium' } = req.body;
  const data = await aiService.generateQuiz({
    topic,
    notes,
    numQuestions: parseInt(numQuestions, 10),
    difficulty,
  });
  apiResponse.success(res, data, 'Quiz generated');
});

const summarizeNotes = asyncHandler(async (req, res) => {
  const { notes, subject, style = 'bullet' } = req.body;
  const data = await aiService.summarizeNotes({ notes, subject, style });
  apiResponse.success(res, data, 'Notes summarised');
});

/**
 * POST /api/v1/ai/scan-summarize
 * Accepts OCR-extracted text (from client-side scanner) and returns an AI summary.
 */
const scanAndSummarize = asyncHandler(async (req, res) => {
  const { extractedText, subject, style = 'bullet' } = req.body;
  const data = await aiService.scanAndSummarize({ extractedText, subject, style });
  apiResponse.success(res, data, 'Scan summarised');
});

const askQuestion = asyncHandler(async (req, res) => {
  const { question, context } = req.body;
  const data = await aiService.askQuestion({ question, context });
  apiResponse.success(res, data, 'Question answered');
});

/**
 * POST /api/v1/ai/speak
 * Convert text to speech using OpenAI TTS.
 */
const generateSpeech = asyncHandler(async (req, res) => {
  const { text, voice = 'alloy', format = 'mp3' } = req.body;
  
  const data = await aiService.generateSpeech({ text, voice, format });
  
  // Return audio as binary response
  res.set({
    'Content-Type': `audio/${format}`,
    'Content-Length': data.audio.length,
    'Content-Disposition': `inline; filename="speech.${format}"`,
  });
  
  res.send(data.audio);
});

/**
 * GET /api/v1/ai/recommendations
 * Generate personalized study recommendations based on user's analytics.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Fetch user's learning analytics
  const analytics = await analyticsService.getLearningAnalytics(userId);
  
  // Generate AI-powered recommendations
  const data = await aiService.generateRecommendations({ 
    analytics, 
    userId: userId.toString() 
  });
  
  apiResponse.success(res, data, 'Recommendations generated');
});

module.exports = { 
  generateQuiz, 
  summarizeNotes, 
  scanAndSummarize, 
  askQuestion,
  generateSpeech,
  getRecommendations,
};
