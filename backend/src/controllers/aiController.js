// Placeholder AI controller — wire up your preferred AI provider (e.g. OpenAI) here

const generateQuiz = (req, res) => {
  const { topic, numQuestions = 5 } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  // TODO: call AI provider to generate quiz questions for `topic`
  res.json({ message: `Quiz generation for "${topic}" coming soon`, numQuestions });
};

const summarizeNotes = (req, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: 'notes are required' });
  // TODO: call AI provider to summarize notes
  res.json({ message: 'Summarization coming soon', length: notes.length });
};

const askQuestion = (req, res) => {
  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: 'question is required' });
  // TODO: call AI provider with question and optional study context
  res.json({ message: 'Q&A coming soon', question });
};

module.exports = { generateQuiz, summarizeNotes, askQuestion };
