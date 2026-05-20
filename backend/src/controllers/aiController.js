const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;
  const data = await aiService.generateQuiz({ topic, numQuestions: parseInt(numQuestions, 10) });
  apiResponse.success(res, data, 'Quiz generated');
});

const summarizeNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const data = await aiService.summarizeNotes({ notes });
  apiResponse.success(res, data, 'Notes summarized');
});

const askQuestion = asyncHandler(async (req, res) => {
  const { question, context } = req.body;
  const data = await aiService.askQuestion({ question, context });
  apiResponse.success(res, data, 'Question processed');
});

module.exports = { generateQuiz, summarizeNotes, askQuestion };
