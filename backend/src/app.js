const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const rateLimiter = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', config.upload.uploadDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static files (uploaded images) ───────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health check (exempt from rate limiter) ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes (rate-limited) ─────────────────────────────────────────────────
app.use(config.api.prefix, rateLimiter, routes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
