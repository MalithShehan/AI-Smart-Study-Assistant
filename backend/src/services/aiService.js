const OpenAI = require('openai');
const config = require('../config');

// ── Lazy singleton client ─────────────────────────────────────────────────────
let _client = null;
const getClient = () => {
  if (!_client) {
    if (!config.ai.apiKey) {
      const err = new Error('OPENAI_API_KEY is not configured');
      err.statusCode = 503;
      throw err;
    }
    _client = new OpenAI({
      apiKey: config.ai.apiKey,
      timeout: config.ai.timeout,
      maxRetries: 0, // we handle retries manually for full control
    });
  }
  return _client;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Rough token estimator: ~4 characters per token (OpenAI rule of thumb).
 * Avoids pulling in tiktoken for a lightweight implementation.
 */
const estimateTokens = (text) => Math.ceil(text.length / 4);

/**
 * Truncate text so its estimated token count stays under `maxChars`.
 * Appends a notice so the model knows content was cut.
 */
const truncateInput = (text, maxChars = config.ai.maxInputChars) => {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[...content truncated for token optimization...]';
};

/**
 * Retry wrapper with exponential back-off.
 * Retries on transient OpenAI errors (rate limit 429, server errors 5xx).
 */
const withRetry = async (fn, attempts = config.ai.retryAttempts) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable =
        err instanceof OpenAI.RateLimitError ||
        err instanceof OpenAI.InternalServerError ||
        err instanceof OpenAI.APIConnectionTimeoutError;
      if (!isRetryable || i === attempts - 1) throw err;
      // Exponential back-off: 1s, 2s, 4s …
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw lastErr;
};

/**
 * Central chat-completion call. Returns the assistant message string.
 */
const chat = async (messages, { maxTokens, temperature } = {}) => {
  const client = getClient();
  const response = await withRetry(() =>
    client.chat.completions.create({
      model: config.ai.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    })
  );
  const choice = response.choices[0];
  if (!choice || !choice.message) throw new Error('Empty response from OpenAI');
  return {
    content: choice.message.content.trim(),
    usage: response.usage, // { prompt_tokens, completion_tokens, total_tokens }
    finishReason: choice.finish_reason,
  };
};

// ── Public service functions ──────────────────────────────────────────────────

/**
 * Summarize raw text notes (typed or OCR-extracted from a scan).
 * @param {object} opts
 * @param {string} opts.notes       - Raw note content
 * @param {string} [opts.subject]   - Optional subject hint for better context
 * @param {'concise'|'detailed'|'bullet'} [opts.style] - Summary style
 */
const summarizeNotes = async ({ notes, subject = '', style = 'bullet' }) => {
  const truncated = truncateInput(notes);
  const styleInstructions = {
    concise: 'Write a concise 2-3 sentence paragraph summary.',
    detailed: 'Write a detailed, well-structured summary with headings.',
    bullet: 'Write a summary as clear, organised bullet points grouped by theme.',
  };
  const instruction = styleInstructions[style] || styleInstructions.bullet;
  const subjectHint = subject ? ` The subject is: ${subject}.` : '';

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert study assistant. Your summaries are accurate, concise, and student-friendly.' +
        subjectHint,
    },
    {
      role: 'user',
      content: `${instruction}\n\nNotes to summarise:\n\n${truncated}`,
    },
  ];

  const result = await chat(messages, {
    maxTokens: config.ai.maxTokens.summary,
    temperature: config.ai.temperature.summary,
  });

  return {
    summary: result.content,
    style,
    subject: subject || null,
    inputChars: notes.length,
    wasTruncated: notes.length > config.ai.maxInputChars,
    usage: result.usage,
  };
};

/**
 * Summarize text extracted from a scanned/photographed note page.
 * Wraps summarizeNotes with OCR-specific pre-processing.
 * @param {object} opts
 * @param {string} opts.extractedText  - Raw OCR output
 * @param {string} [opts.subject]
 * @param {'concise'|'detailed'|'bullet'} [opts.style]
 */
const scanAndSummarize = async ({ extractedText, subject = '', style = 'bullet' }) => {
  if (!extractedText || !extractedText.trim()) {
    const err = new Error('No text was extracted from the scan');
    err.statusCode = 422;
    throw err;
  }

  // Light OCR noise cleanup: collapse excessive whitespace / line-breaks
  const cleaned = extractedText.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  const result = await summarizeNotes({ notes: cleaned, subject, style });
  return { ...result, source: 'scan' };
};

/**
 * Generate quiz questions from a topic or notes.
 * @param {object} opts
 * @param {string} opts.topic
 * @param {string} [opts.notes]         - Optional notes to base questions on
 * @param {number} [opts.numQuestions]
 * @param {'easy'|'medium'|'hard'} [opts.difficulty]
 */
const generateQuiz = async ({ topic, notes = '', numQuestions = 5, difficulty = 'medium' }) => {
  const context = notes ? `\n\nBase questions on these notes:\n${truncateInput(notes)}` : '';

  const messages = [
    {
      role: 'system',
      content:
        'You are a quiz generator. Always respond with a valid JSON array of question objects. ' +
        'Each object must have: "question" (string), "options" (array of 4 strings), ' +
        '"answer" (the correct option string), "explanation" (brief string).',
    },
    {
      role: 'user',
      content:
        `Generate ${numQuestions} ${difficulty} multiple-choice questions about "${topic}".` +
        context +
        '\n\nReturn ONLY the JSON array, no markdown fences or extra text.',
    },
  ];

  const result = await chat(messages, {
    maxTokens: config.ai.maxTokens.quiz,
    temperature: config.ai.temperature.quiz,
  });

  let questions;
  try {
    // Strip accidental markdown fences the model may add despite instructions
    const raw = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    questions = JSON.parse(raw);
    if (!Array.isArray(questions)) throw new Error('Expected array');
  } catch {
    const err = new Error('AI returned malformed quiz JSON');
    err.statusCode = 502;
    err.raw = result.content;
    throw err;
  }

  return {
    topic,
    difficulty,
    numQuestions: questions.length,
    questions,
    usage: result.usage,
  };
};

/**
 * Answer a study question, optionally grounded in provided context.
 * @param {object} opts
 * @param {string} opts.question
 * @param {string} [opts.context]  - Relevant notes or text to ground the answer
 */
const askQuestion = async ({ question, context = '' }) => {
  const contextBlock = context
    ? `\n\nUse the following study material as context:\n${truncateInput(context, 6000)}`
    : '';

  const messages = [
    {
      role: 'system',
      content:
        'You are a knowledgeable and friendly study assistant. Give clear, accurate answers. ' +
        'If you are unsure, say so rather than guessing.',
    },
    {
      role: 'user',
      content: `${question}${contextBlock}`,
    },
  ];

  const result = await chat(messages, {
    maxTokens: config.ai.maxTokens.qa,
    temperature: config.ai.temperature.qa,
  });

  return {
    question,
    answer: result.content,
    hasContext: !!context,
    usage: result.usage,
  };
};

module.exports = { summarizeNotes, scanAndSummarize, generateQuiz, askQuestion };
