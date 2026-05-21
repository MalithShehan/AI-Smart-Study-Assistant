const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const { defaultLimiter } = require('./middlewares/rateLimiter');
const { mongoSanitizeMiddleware, xssSanitize, hppMiddleware } = require('./middlewares/sanitize');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const swaggerSpec = require('./docs/swagger');
const logger = require('./utils/logger');

const app = express();

// ── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', config.upload.uploadDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Trust proxy (Render / Railway / Heroku sit behind a reverse proxy) ────────
app.set('trust proxy', 1);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Security headers (Helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],   // needed for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,   // allow Swagger UI assets
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({ origin: config.cors.origin, credentials: true }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── MongoDB injection sanitization ───────────────────────────────────────────
app.use(mongoSanitizeMiddleware);

// ── XSS sanitization ─────────────────────────────────────────────────────────
app.use(xssSanitize);

// ── HTTP Parameter Pollution prevention ──────────────────────────────────────
app.use(hppMiddleware);

// ── Static files (uploaded images) ───────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health check (no rate limit, no auth) ────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ── Swagger UI (disabled in production unless ENABLE_SWAGGER=true) ────────────
if (config.env !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'AI Study Assistant API',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: { persistAuthorization: true },
    }),
  );
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  logger.info(`Swagger UI available at /api-docs`);
}

// ── API routes (rate-limited) ─────────────────────────────────────────────────
app.use(config.api.prefix, defaultLimiter, routes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
