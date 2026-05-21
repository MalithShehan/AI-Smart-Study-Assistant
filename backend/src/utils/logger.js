'use strict';

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// ── Custom log format ─────────────────────────────────────────────────────────
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${metaStr}${stack ? '\n' + stack : ''}`;
  }),
);

const jsonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

// ── Transports ────────────────────────────────────────────────────────────────
const dailyRotateError = new transports.DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  format: jsonFormat,
});

const dailyRotateCombined = new transports.DailyRotateFile({
  filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: jsonFormat,
});

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), logFormat),
});

// ── Logger instance ───────────────────────────────────────────────────────────
const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  exitOnError: false,
  transports: [
    dailyRotateError,
    dailyRotateCombined,
    ...(process.env.NODE_ENV !== 'test' ? [consoleTransport] : []),
  ],
});

// ── Morgan stream integration ─────────────────────────────────────────────────
logger.stream = {
  write: (message) => logger.http(message.trimEnd()),
};

module.exports = logger;
