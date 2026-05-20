const config = require('../config');

/**
 * AI business logic.
 * Wire up your preferred AI provider (OpenAI, Gemini, etc.) here
 * using config.ai.apiKey and config.ai.model.
 */

const generateQuiz = async ({ topic, numQuestions }) => {
  // TODO: call AI provider to generate quiz questions
  return {
    topic,
    numQuestions,
    questions: [],
    message: `Quiz generation for "${topic}" coming soon`,
  };
};

const summarizeNotes = async ({ notes }) => {
  // TODO: call AI provider to summarize notes
  return {
    summary: null,
    charCount: notes.length,
    message: 'Summarization coming soon',
  };
};

const askQuestion = async ({ question, context }) => {
  // TODO: call AI provider with question and optional study context
  return {
    question,
    context: context || null,
    answer: null,
    message: 'Q&A coming soon',
  };
};

module.exports = { generateQuiz, summarizeNotes, askQuestion };
