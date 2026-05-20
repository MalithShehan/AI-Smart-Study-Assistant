const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const rateLimiter = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health check (exempt from rate limiter) ──────────────────────────────────
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
