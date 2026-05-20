const morgan = require('morgan');
const config = require('../config');

// 'dev' format in development, 'combined' (Apache standard) in production
const format = config.env === 'production' ? 'combined' : 'dev';

module.exports = morgan(format);
