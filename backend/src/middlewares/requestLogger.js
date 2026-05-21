'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');
const config = require('../config');

// Use 'combined' in production for full Apache-style logs, 'dev' in dev for coloured output.
const format = config.env === 'production' ? 'combined' : 'dev';

// In production, pipe morgan output into winston so all logs go to the same files.
const stream = config.env === 'production' ? logger.stream : undefined;

module.exports = morgan(format, { stream });
