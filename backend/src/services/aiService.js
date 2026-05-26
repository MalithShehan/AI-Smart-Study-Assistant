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

  const schema = JSON.stringify({
    questionNumber: 1,
    type: 'mcq',
    difficulty,
    topic: '<sub-topic this question covers>',
    question: '<question text>',
    options: ['A) ...', 'B) ...', 'C) ...', 'D) ...'],
    answer: '<the full correct option string, e.g. "A) ...">',
    explanation: '<why the answer is correct and why the others are not>',
  });

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert quiz generator. Always respond with a valid JSON array. ' +
        `Each element must match this schema exactly:\n${schema}\n` +
        'Ensure options are plausible distractors. Explanations must be clear and educational. ' +
        'Return ONLY the JSON array — no markdown fences or additional text.',
    },
    {
      role: 'user',
      content:
        `Generate ${numQuestions} ${difficulty} multiple-choice questions about "${topic}".` +
        context,
    },
  ];

  const result = await chat(messages, {
    maxTokens: config.ai.maxTokens.quiz,
    temperature: config.ai.temperature.quiz,
  });

  let questions;
  try {
    // Strip accidental markdown fences the model may add despite instructions
    const raw = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    questions = JSON.parse(raw);
    if (!Array.isArray(questions)) throw new Error('Expected array');
    // Normalise questionNumber in case the model skips it
    questions = questions.map((q, i) => ({ questionNumber: i + 1, type: 'mcq', ...q }));
  } catch {
    const err = new Error('AI returned malformed quiz JSON');
    err.statusCode = 502;
    err.raw = result.content;
    throw err;
  }

  return {
    topic,
    difficulty,
    totalQuestions: questions.length,
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

/**
 * Generate spoken audio for text using OpenAI's TTS API.
 * @param {object} opts
 * @param {string} opts.text          - Text to convert to speech
 * @param {'alloy'|'echo'|'fable'|'onyx'|'nova'|'shimmer'} [opts.voice] - Voice preset
 * @param {'mp3'|'opus'|'aac'|'flac'} [opts.format] - Audio format
 * @returns {Promise<Buffer>} Audio buffer
 */
const generateSpeech = async ({ text, voice = 'alloy', format = 'mp3' }) => {
  if (!text || !text.trim()) {
    const err = new Error('Text is required for speech generation');
    err.statusCode = 400;
    throw err;
  }

  // Truncate to ~4096 chars (OpenAI TTS limit)
  const maxChars = 4096;
  const truncated = text.length > maxChars ? text.slice(0, maxChars) : text;

  const client = getClient();
  
  try {
    const response = await withRetry(() =>
      client.audio.speech.create({
        model: 'tts-1',
        voice,
        input: truncated,
        response_format: format,
      })
    );

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audio: buffer,
      voice,
      format,
      textLength: text.length,
      wasTruncated: text.length > maxChars,
    };
  } catch (err) {
    const error = new Error('Failed to generate speech: ' + err.message);
    error.statusCode = 502;
    throw error;
  }
};

/**
 * Generate personalized study recommendations based on user analytics.
 * @param {object} opts
 * @param {object} opts.analytics     - User's learning analytics data
 * @param {string} [opts.userId]      - Optional user ID for context
 */
const generateRecommendations = async ({ analytics, userId = null }) => {
  // Build a comprehensive analytics summary for the AI
  const summary = _buildAnalyticsSummary(analytics);

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert study coach. Analyze student performance data and provide actionable recommendations. ' +
        'Identify weak subjects, suggest study strategies, and create personalized improvement plans. ' +
        'Be encouraging but honest. Return your response as valid JSON with this structure:\n' +
        JSON.stringify({
          weakSubjects: [{ subject: 'string', reason: 'string', priority: 'high|medium|low' }],
          strengths: ['string'],
          recommendations: [{ category: 'string', suggestion: 'string', action: 'string' }],
          studyPlan: { dailyGoalMinutes: 'number', focusAreas: ['string'], weeklyTargets: ['string'] },
          motivationalMessage: 'string',
        }) +
        '\nReturn ONLY the JSON — no markdown fences.',
    },
    {
      role: 'user',
      content: `Analyze this student's performance and provide recommendations:\n\n${summary}`,
    },
  ];

  const result = await chat(messages, {
    maxTokens: 2048,
    temperature: 0.6,
  });

  let recommendations;
  try {
    const raw = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    recommendations = JSON.parse(raw);
  } catch {
    const err = new Error('AI returned malformed recommendations JSON');
    err.statusCode = 502;
    err.raw = result.content;
    throw err;
  }

  return {
    recommendations,
    basedOn: {
      totalActivities: analytics.overview?.totals?.totalSessions || 0,
      totalStudyMinutes: analytics.overview?.totals?.totalStudyMinutes || 0,
      totalQuizzes: analytics.overview?.totals?.totalQuizzes || 0,
    },
    generatedAt: new Date().toISOString(),
    usage: result.usage,
  };
};

/**
 * Build a human-readable summary of analytics for the AI to process.
 */
function _buildAnalyticsSummary(analytics) {
  const { overview, bySubject, quizHistory, studyByDay } = analytics;
  
  let summary = '=== STUDENT PERFORMANCE SUMMARY ===\n\n';

  // Overall stats
  if (overview?.totals) {
    const t = overview.totals;
    summary += `Total Study Time: ${t.totalStudyMinutes || 0} minutes across ${t.totalSessions || 0} sessions\n`;
    summary += `Quizzes Taken: ${t.totalQuizzes || 0}\n`;
    summary += `AI Summaries Generated: ${t.totalAiSummaries || 0}\n`;
    summary += `AI Questions Asked: ${t.totalAiQuestions || 0}\n\n`;
  }

  // Quiz performance
  if (overview?.quizStats) {
    const q = overview.quizStats;
    summary += `Quiz Performance:\n`;
    summary += `  Average Score: ${q.avgScore?.toFixed(1) || 'N/A'}%\n`;
    summary += `  Highest Score: ${q.highestScore || 'N/A'}%\n`;
    summary += `  Lowest Score: ${q.lowestScore || 'N/A'}%\n`;
    summary += `  Total Questions Answered: ${q.totalQuestionsAnswered || 0}\n`;
    summary += `  Correct Answers: ${q.totalCorrectAnswers || 0}\n\n`;
  }

  // Subject breakdown
  if (bySubject?.length) {
    summary += `Activity by Subject:\n`;
    bySubject.slice(0, 5).forEach((s) => {
      summary += `  - ${s.subject}: ${s.totalActivities} activities, ${s.totalMinutes || 0} minutes\n`;
    });
    summary += '\n';
  }

  // Recent quiz performance
  if (quizHistory?.length) {
    summary += `Recent Quiz Attempts (last ${Math.min(quizHistory.length, 10)}):\n`;
    quizHistory.slice(0, 10).forEach((q, i) => {
      summary += `  ${i + 1}. ${q.subject || 'General'}: ${q.score?.toFixed(1) || 'N/A'}% (${q.correctAnswers}/${q.totalQuestions})\n`;
    });
    summary += '\n';
  }

  // Study pattern
  if (studyByDay?.length) {
    const totalDays = studyByDay.length;
    const activeDays = studyByDay.filter(d => d.minutes > 0).length;
    const avgMinutes = studyByDay.reduce((sum, d) => sum + d.minutes, 0) / Math.max(activeDays, 1);
    summary += `Study Pattern (last ${totalDays} days):\n`;
    summary += `  Active Days: ${activeDays}/${totalDays}\n`;
    summary += `  Average Daily Study Time: ${avgMinutes.toFixed(0)} minutes\n\n`;
  }

  // Streak info
  if (overview?.streakInfo) {
    const s = overview.streakInfo;
    summary += `Current Study Streak: ${s.currentStreak || 0} days\n`;
    summary += `Longest Streak: ${s.longestStreak || 0} days\n`;
  }

  return summary;
}

// ══════════════════════════════════════════════════════════════════════════════
// AI STUDY PLAN GENERATOR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate personalized AI study plan
 * @param {Object} params
 * @param {Array<string>} params.subjects - Subjects to cover
 * @param {number} params.studyHours - Available study hours
 * @param {Array<string>} params.focusAreas - Areas needing focus
 * @param {string} params.preferredTime - 'morning' | 'afternoon' | 'evening'
 * @returns {Promise<Object>} Study plan with tasks
 */
async function generateStudyPlan({ subjects, studyHours, focusAreas, preferredTime }) {
  const client = getClient();
  
  const prompt = `You are an expert AI study planner. Create a personalized study plan.

**Requirements:**
- Subjects: ${subjects.join(', ') || 'General'}
- Available Study Time: ${studyHours} hours
- Focus Areas: ${focusAreas.join(', ') || 'Balanced learning'}
- Preferred Time: ${preferredTime}

**Instructions:**
1. Create a balanced study plan with specific tasks
2. Include breaks every 60-90 minutes
3. Mix different types of activities (reading, practice, quizzes, revision)
4. Assign realistic durations to each task
5. Prioritize focus areas

**Response Format (JSON):**
{
  "title": "Study Plan Title",
  "summary": "Brief overview of the plan",
  "motivationalMessage": "Encouraging message for the student",
  "tasks": [
    {
      "title": "Task title",
      "subject": "Subject name",
      "duration": 45,
      "priority": "high|medium|low",
      "type": "revision|practice|quiz|reading|video|break",
      "description": "What to do",
      "timeSlot": "09:00-09:45"
    }
  ]
}

Generate the plan now:`;

  try {
    const completion = await withRetry(() =>
      client.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI study planner who creates effective, personalized study schedules.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    const result = JSON.parse(completion.choices[0].message.content);
    
    return {
      title: result.title || 'Your Study Plan',
      summary: result.summary || '',
      motivationalMessage: result.motivationalMessage || 'You got this! 💪',
      tasks: result.tasks || [],
      prompt,
    };
  } catch (error) {
    console.error('AI Study Plan Error:', error);
    
    // Fallback plan
    return _generateFallbackPlan({ subjects, studyHours, focusAreas, preferredTime });
  }
}

/**
 * Generate fallback study plan (if AI fails)
 */
function _generateFallbackPlan({ subjects, studyHours, focusAreas, preferredTime }) {
  const tasks = [];
  let startHour = preferredTime === 'morning' ? 9 : preferredTime === 'afternoon' ? 14 : 18;
  let currentTime = startHour;
  
  const sessionDuration = 45;
  const breakDuration = 15;
  const subjectsList = subjects.length > 0 ? subjects : ['Mathematics', 'Science', 'English'];
  
  for (let i = 0; i < Math.floor(studyHours * 60 / (sessionDuration + breakDuration)); i++) {
    const subject = subjectsList[i % subjectsList.length];
    const taskType = i % 3 === 0 ? 'revision' : i % 3 === 1 ? 'practice' : 'quiz';
    
    const endTime = currentTime + sessionDuration / 60;
    tasks.push({
      title: `Study ${subject}`,
      subject,
      duration: sessionDuration,
      priority: focusAreas.includes(subject) ? 'high' : 'medium',
      type: taskType,
      description: `${taskType === 'revision' ? 'Review' : taskType === 'practice' ? 'Practice problems for' : 'Take quiz on'} ${subject}`,
      timeSlot: `${String(Math.floor(currentTime)).padStart(2, '0')}:${String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}-${String(Math.floor(endTime)).padStart(2, '0')}:${String(Math.floor((endTime % 1) * 60)).padStart(2, '0')}`,
      order: tasks.length,
    });
    
    currentTime = endTime;
    
    // Add break
    if (i < Math.floor(studyHours * 60 / (sessionDuration + breakDuration)) - 1) {
      const breakEnd = currentTime + breakDuration / 60;
      tasks.push({
        title: 'Break',
        subject: 'Break',
        duration: breakDuration,
        priority: 'low',
        type: 'break',
        description: 'Take a short break, stretch, hydrate',
        timeSlot: `${String(Math.floor(currentTime)).padStart(2, '0')}:${String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}-${String(Math.floor(breakEnd)).padStart(2, '0')}:${String(Math.floor((breakEnd % 1) * 60)).padStart(2, '0')}`,
        order: tasks.length,
      });
      currentTime = breakEnd;
    }
  }
  
  return {
    title: 'Your Personalized Study Plan',
    summary: `Focused ${studyHours}-hour study session covering ${subjectsList.join(', ')}`,
    motivationalMessage: 'Stay focused and take regular breaks! You\'re doing great! 🌟',
    tasks,
    prompt: 'Fallback plan generated',
  };
}

module.exports = { 
  summarizeNotes, 
  scanAndSummarize, 
  generateQuiz, 
  askQuestion,
  generateSpeech,
  generateRecommendations,
  generateStudyPlan,
};
