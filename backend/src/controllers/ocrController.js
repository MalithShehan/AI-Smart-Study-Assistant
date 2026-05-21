const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/ocr/extract
 * Extract text from an uploaded image (JPEG/PNG/WEBP) or text-layer PDF.
 * Returns raw extracted text, word count, char count, and source engine.
 * Multipart field name: "file"
 */
const extractText = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No file provided', 400);

  const result = await ocrService.extractText(req.file.buffer, req.file.mimetype);
  apiResponse.success(res, result, 'Text extracted successfully');
});

/**
 * POST /api/v1/ocr/extract-summarize
 * Extract text from image/PDF then AI-summarize it in one step.
 * Body (optional): subject, style ('concise' | 'detailed' | 'bullet')
 * Multipart field name: "file"
 */
const extractAndSummarize = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No file provided', 400);

  const { subject, style = 'bullet' } = req.body;

  const ocr = await ocrService.extractText(req.file.buffer, req.file.mimetype);
  const summary = await aiService.summarizeNotes({ notes: ocr.text, subject, style });

  apiResponse.success(
    res,
    {
      extraction: {
        wordCount: ocr.wordCount,
        charCount: ocr.charCount,
        source: ocr.source,
        ...(ocr.pages && { pages: ocr.pages }),
      },
      summary,
    },
    'Text extracted and summarised'
  );
});

/**
 * POST /api/v1/ocr/extract-quiz
 * Extract text from image/PDF then generate an MCQ quiz in one step.
 * Body (optional): topic, subject, numQuestions (1-20), difficulty ('easy'|'medium'|'hard')
 * Multipart field name: "file"
 */
const extractAndGenerateQuiz = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No file provided', 400);

  const { topic, subject, numQuestions = 5, difficulty = 'medium' } = req.body;

  const ocr = await ocrService.extractText(req.file.buffer, req.file.mimetype);

  const quiz = await aiService.generateQuiz({
    topic: topic || subject || 'the provided study notes',
    notes: ocr.text,
    numQuestions: parseInt(numQuestions, 10),
    difficulty,
  });

  apiResponse.success(
    res,
    {
      extraction: {
        wordCount: ocr.wordCount,
        charCount: ocr.charCount,
        source: ocr.source,
        ...(ocr.pages && { pages: ocr.pages }),
      },
      quiz,
    },
    'Quiz generated from uploaded file'
  );
});

module.exports = { extractText, extractAndSummarize, extractAndGenerateQuiz };
