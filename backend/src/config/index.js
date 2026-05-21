require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  api: {
    prefix: '/api/v1',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_study_assistant',
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL, 10) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'AI Study Assistant <noreply@example.com>',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,   // 10 MB images
    maxPdfSize: parseInt(process.env.MAX_PDF_SIZE, 10) || 20 * 1024 * 1024,     // 20 MB PDFs
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedPdfTypes: ['application/pdf'],
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    // Token budgets per task (prompt + completion combined)
    maxTokens: {
      summary: parseInt(process.env.AI_MAX_TOKENS_SUMMARY, 10) || 1024,
      quiz: parseInt(process.env.AI_MAX_TOKENS_QUIZ, 10) || 2048,
      qa: parseInt(process.env.AI_MAX_TOKENS_QA, 10) || 512,
    },
    temperature: {
      summary: parseFloat(process.env.AI_TEMP_SUMMARY) || 0.3,
      quiz: parseFloat(process.env.AI_TEMP_QUIZ) || 0.7,
      qa: parseFloat(process.env.AI_TEMP_QA) || 0.5,
    },
    // Hard cap on input characters before truncation (~4 chars ≈ 1 token)
    maxInputChars: parseInt(process.env.AI_MAX_INPUT_CHARS, 10) || 12000,
    timeout: parseInt(process.env.AI_TIMEOUT_MS, 10) || 30000,
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS, 10) || 3,
  },

  firebase: {
    // Path to your Firebase service account JSON key file
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
  },

  swagger: {
    enabled: process.env.ENABLE_SWAGGER !== 'false',
  },

  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },

  admin: {
    // Comma-separated list of emails that are automatically given admin role on register
    seedEmails: (process.env.ADMIN_SEED_EMAILS || '').split(',').filter(Boolean),
  },
};

module.exports = config;
