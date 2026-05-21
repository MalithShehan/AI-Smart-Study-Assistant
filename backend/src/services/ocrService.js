const OpenAI = require('openai');
const config = require('../config');

// ── Lazy OpenAI client ─────────────────────────────────────────────────────────
let _client = null;
const getClient = () => {
  if (_client) return _client;
  if (!config.ai.apiKey) {
    const err = new Error('OPENAI_API_KEY is not configured');
    err.statusCode = 503;
    throw err;
  }
  _client = new OpenAI({ apiKey: config.ai.apiKey, timeout: config.ai.timeout });
  return _client;
};

// ── Image OCR via GPT-4o Vision ────────────────────────────────────────────────

/**
 * Extract all text from an image buffer using GPT-4o vision.
 * Handles printed text, handwriting, diagrams, tables, and mixed layouts.
 *
 * @param {Buffer} imageBuffer
 * @param {string} [mimeType='image/jpeg']
 * @returns {Promise<{ text: string, wordCount: number, charCount: number, source: string, usage: object }>}
 */
const extractTextFromImage = async (imageBuffer, mimeType = 'image/jpeg') => {
  const client = getClient();
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a precise OCR assistant. Extract ALL visible text from the image, preserving ' +
          'the original structure: headings, bullet points, numbered lists, and tables. ' +
          'If the image contains diagrams or charts, describe them concisely inside [brackets]. ' +
          'Output only the extracted text — no markdown code fences or commentary.',
      },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
          { type: 'text', text: 'Extract all text from this study note image.' },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0,
  });

  const text = response.choices[0]?.message?.content?.trim() || '';
  if (!text) {
    const err = new Error('No text could be extracted from the image');
    err.statusCode = 422;
    throw err;
  }

  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    charCount: text.length,
    source: 'openai-vision',
    usage: response.usage,
  };
};

// ── PDF text extraction via pdf-parse ─────────────────────────────────────────

/**
 * Extract plain text from a PDF buffer.
 * Works only with text-layer PDFs; image-based PDFs require the image OCR path.
 *
 * @param {Buffer} pdfBuffer
 * @returns {Promise<{ text: string, wordCount: number, charCount: number, pages: number, source: string }>}
 */
const extractTextFromPdf = async (pdfBuffer) => {
  // Dynamic require so the rest of the service still works if pdf-parse is absent
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
  } catch {
    const err = new Error('pdf-parse is not installed. Run: npm install pdf-parse');
    err.statusCode = 503;
    throw err;
  }

  const data = await pdfParse(pdfBuffer);
  const text = data.text.trim();

  if (!text) {
    const err = new Error(
      'No extractable text found in this PDF. ' +
        'It may be a scanned image — try the image OCR endpoint instead.'
    );
    err.statusCode = 422;
    throw err;
  }

  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    charCount: text.length,
    pages: data.numpages,
    source: 'pdf-parse',
  };
};

// ── Unified entry point ────────────────────────────────────────────────────────

/**
 * Route extraction to the correct engine based on MIME type.
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
const extractText = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') return extractTextFromPdf(buffer);
  return extractTextFromImage(buffer, mimeType);
};

module.exports = { extractText, extractTextFromImage, extractTextFromPdf };
